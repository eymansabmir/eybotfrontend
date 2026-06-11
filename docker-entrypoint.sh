#!/bin/sh
set -eu

ALLOWED_HOSTS="${ALLOWED_HOSTS:-localhost}"
SERVER_NAMES="$(printf '%s' "$ALLOWED_HOSTS" | tr ',' ' ')"
FRONTEND_RATE="${FRONTEND_RATE_LIMIT:-60r/m}"
FRONTEND_BURST="${FRONTEND_RATE_BURST:-20}"

# API origin allowed in CSP connect-src (no path suffix).
CSP_CONNECT_SRC="${CSP_CONNECT_SRC:-https://devwhatsappbe.epf6.in}"
CSP_CONNECT_SRC="${CSP_CONNECT_SRC%/api}"
CSP_CONNECT_SRC="${CSP_CONNECT_SRC%/}"

CSP="default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' ${CSP_CONNECT_SRC}; object-src 'none'; upgrade-insecure-requests"

cat > /etc/nginx/conf.d/00-security.conf <<'EOF'
# Banner grabbing: hide nginx version in Server header and error pages.
server_tokens off;
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

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "${CSP}" always;

    location / {
        limit_req zone=frontend_per_ip burst=${FRONTEND_BURST} nodelay;
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header Content-Security-Policy "${CSP}" always;
    }
}
EOF

exec nginx -g 'daemon off;'
