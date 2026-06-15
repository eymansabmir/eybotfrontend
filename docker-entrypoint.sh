#!/bin/sh
set -eu

# Hostnames only (no scheme/path/port). Commas separate multiple hosts.
normalize_hosts() {
  normalized=""
  old_ifs=$IFS
  IFS=','

  for host in $1; do
    # trim whitespace and CR (Windows env files)
    host=$(printf '%s' "$host" | tr -d ' \t\r\n')
    [ -z "$host" ] && continue
    host=${host#https://}
    host=${host#http://}
    host=${host%%/*}
    host=${host%%:*}
    [ -z "$host" ] && continue
    normalized="${normalized:+$normalized }$host"
  done

  IFS=$old_ifs
  printf '%s' "$normalized"
}

raw_allowed_hosts="${ALLOWED_HOSTS:-localhost}"
SERVER_NAMES="$(normalize_hosts "$raw_allowed_hosts")"
[ -z "$SERVER_NAMES" ] && SERVER_NAMES="localhost"
echo "nginx allowed hosts: ${SERVER_NAMES}" >&2
FRONTEND_RATE="${FRONTEND_RATE_LIMIT:-60r/m}"
FRONTEND_BURST="${FRONTEND_RATE_BURST:-20}"

# API origin allowed in CSP connect-src (no path suffix).
CSP_CONNECT_SRC="${CSP_CONNECT_SRC:-http://localhost:3000}"
CSP_CONNECT_SRC="${CSP_CONNECT_SRC%/api}"
CSP_CONNECT_SRC="${CSP_CONNECT_SRC%/}"

CSP="default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' ${CSP_CONNECT_SRC}; object-src 'none'; upgrade-insecure-requests"

# nginx resets ALL inherited add_header directives in any location that declares
# its own add_header, so the security headers must be repeated in every location
# that sets a Cache-Control header. Keep this block as the single source of truth.
SECURITY_HEADERS=$(cat <<EOF
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "${CSP}" always;
EOF
)

cat > /etc/nginx/conf.d/00-security.conf <<'EOF'
# Banner grabbing: hide nginx version in Server header and error pages.
server_tokens off;

# Compress text assets (binary assets like images are already compressed).
gzip on;
gzip_comp_level 6;
gzip_min_length 1024;
gzip_vary on;
gzip_proxied any;
gzip_types
    text/plain
    text/css
    text/javascript
    text/xml
    application/javascript
    application/json
    application/xml
    application/rss+xml
    application/wasm
    image/svg+xml;
EOF

cat > /etc/nginx/conf.d/rate-limit.conf <<EOF
limit_req_zone \$binary_remote_addr zone=frontend_per_ip:10m rate=${FRONTEND_RATE};
limit_req_status 429;
EOF

cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen 8080 default_server;
    server_name _;
    return 403;
}

server {
    listen 8080;
    server_name ${SERVER_NAMES};

${SECURITY_HEADERS}

    # Content-hashed build assets (Vite emits to /assets/*). Immutable + long cache,
    # and intentionally NOT rate limited so a single page load (dozens of chunks)
    # is never throttled.
    location /assets/ {
        root /usr/share/nginx/html;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
${SECURITY_HEADERS}
    }

    # SPA shell + root-level files (favicon, manifest, etc.). Rate limited and
    # never cached so deploys take effect immediately.
    location / {
        limit_req zone=frontend_per_ip burst=${FRONTEND_BURST} nodelay;
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache" always;
${SECURITY_HEADERS}
    }

    location = /health {
        access_log off;
        default_type text/plain;
        return 200 "ok";
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
${SECURITY_HEADERS}
    }
}
EOF

exec nginx -g 'daemon off;'
