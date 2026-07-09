import { ENV } from "@/config/env";

export interface CreateUserInput {
  email: string;
  name: string;
  role: string;
}

async function getAppToken(): Promise<string> {
  const baseApiUrl = ENV.API_URL.replace(/\/api$/, "");
  const res = await fetch(`${baseApiUrl}/api/v1/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appId: "roi_live_406dbf1349fa85f8",
      appSecret: "d55bf04610900360f4cb4693b896be95",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to authenticate with backend.");
  }

  const data = await res.json();
  const token = data.token || data.accessToken || data.data?.token || data.data?.accessToken;
  if (!token) throw new Error("Could not parse access token from backend response.");
  return token;
}

export async function createUserApi(input: CreateUserInput): Promise<{ message: string }> {
  const token = await getAppToken();

  const res = await fetch(`${ENV.API_URL}/auth/create-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    let errMsg = data.message || data.error || "Failed to create user.";
    if (data.errors && Array.isArray(data.errors)) {
      errMsg = data.errors.map((e: any) => e.message || e.msg || String(e)).join(", ");
    } else if (data.details) {
      errMsg += " " + JSON.stringify(data.details);
    }
    throw new Error(errMsg);
  }

  return { message: data.message || "User successfully registered!" };
}
