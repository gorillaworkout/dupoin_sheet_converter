// Xero OAuth2 + API helper
// Uses refresh_token flow for persistent access

const XERO_TOKEN_URL = "https://identity.xero.com/connect/token";
const XERO_API_BASE = "https://api.xero.com/api.xro/2.0";
const XERO_CONNECTIONS_URL = "https://api.xero.com/connections";

interface XeroTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  tenant_id?: string;
}

// In-memory token store (persists across requests within same process)
let tokenStore: XeroTokens | null = null;

export function setTokens(tokens: Partial<XeroTokens>) {
  tokenStore = {
    access_token: tokens.access_token || "",
    refresh_token: tokens.refresh_token || "",
    expires_at: tokens.expires_at || Date.now() + 1800 * 1000,
    tenant_id: tokens.tenant_id || tokenStore?.tenant_id,
  };
}

export function getStoredTokens(): XeroTokens | null {
  return tokenStore;
}

export function isAuthenticated(): boolean {
  return !!tokenStore?.refresh_token;
}

async function refreshAccessToken(): Promise<string> {
  if (!tokenStore?.refresh_token) {
    throw new Error("No refresh token available. Please re-authenticate with Xero.");
  }

  const clientId = process.env.XERO_CLIENT_ID!;
  const clientSecret = process.env.XERO_CLIENT_SECRET!;
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(XERO_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokenStore.refresh_token,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to refresh Xero token: ${res.status} ${text}`);
  }

  const data = await res.json();
  tokenStore = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    tenant_id: tokenStore.tenant_id,
  };

  return data.access_token;
}

async function getAccessToken(): Promise<string> {
  if (!tokenStore) {
    throw new Error("Not authenticated with Xero. Please connect first.");
  }

  // Refresh if expiring within 60 seconds
  if (Date.now() > tokenStore.expires_at - 60000) {
    return refreshAccessToken();
  }

  return tokenStore.access_token;
}

async function getTenantId(): Promise<string> {
  if (tokenStore?.tenant_id) return tokenStore.tenant_id;

  const token = await getAccessToken();
  const res = await fetch(XERO_CONNECTIONS_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to get Xero connections");

  const connections = await res.json();
  if (!connections.length) throw new Error("No Xero organizations connected");

  const tenantId = connections[0].tenantId;
  if (tokenStore) tokenStore.tenant_id = tenantId;
  return tenantId;
}

// ── Xero API calls ──

export async function getBalanceSheet(date?: string): Promise<unknown> {
  const token = await getAccessToken();
  const tenantId = await getTenantId();

  const params = new URLSearchParams();
  if (date) params.set("date", date);
  params.set("periods", "2");
  params.set("timeframe", "MONTH");

  const url = `${XERO_API_BASE}/Reports/BalanceSheet?${params}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Xero-Tenant-Id": tenantId,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      // Try refresh and retry once
      const newToken = await refreshAccessToken();
      const retry = await fetch(url, {
        headers: {
          Authorization: `Bearer ${newToken}`,
          "Xero-Tenant-Id": tenantId,
          Accept: "application/json",
        },
      });
      if (!retry.ok) throw new Error(`Xero API error: ${retry.status}`);
      return retry.json();
    }
    throw new Error(`Xero API error: ${res.status}`);
  }

  return res.json();
}

export async function getProfitAndLoss(
  fromDate?: string,
  toDate?: string
): Promise<unknown> {
  const token = await getAccessToken();
  const tenantId = await getTenantId();

  const params = new URLSearchParams();
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  params.set("periods", "2");
  params.set("timeframe", "MONTH");

  const url = `${XERO_API_BASE}/Reports/ProfitAndLoss?${params}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Xero-Tenant-Id": tenantId,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      const retry = await fetch(url, {
        headers: {
          Authorization: `Bearer ${newToken}`,
          "Xero-Tenant-Id": tenantId,
          Accept: "application/json",
        },
      });
      if (!retry.ok) throw new Error(`Xero API error: ${retry.status}`);
      return retry.json();
    }
    throw new Error(`Xero API error: ${res.status}`);
  }

  return res.json();
}

// ── OAuth2 helpers ──

export function getAuthUrl(state: string = "xero_auth"): string {
  const clientId = process.env.XERO_CLIENT_ID!;
  const redirectUri = process.env.XERO_REDIRECT_URI!;
  const scopes = "openid profile email accounting.reports.read accounting.settings offline_access";

  return `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;
}

export async function exchangeCode(code: string): Promise<XeroTokens> {
  const clientId = process.env.XERO_CLIENT_ID!;
  const clientSecret = process.env.XERO_CLIENT_SECRET!;
  const redirectUri = process.env.XERO_REDIRECT_URI!;
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(XERO_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const tokens: XeroTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  setTokens(tokens);
  // Fetch tenant ID immediately
  await getTenantId();

  return tokens;
}
