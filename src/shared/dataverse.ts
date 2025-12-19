import fetch from "node-fetch";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: { token: string; exp: number } | null = null;

function getDvPrefix(): string {
  return process.env.DATAVERSE_PREFIX || "bcf_";
}

/**
 * Obtient un token OAuth2 Dataverse
 * Cache le token pour éviter les appels répétés
 */
async function getDataverseToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) {
    return cachedToken.token;
  }

  const tenantId = process.env.DATAVERSE_TENANT_ID!;
  const clientId = process.env.DATAVERSE_CLIENT_ID!;
  const clientSecret = process.env.DATAVERSE_CLIENT_SECRET!;
  const resource = process.env.DATAVERSE_URL!;

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: `${resource}/.default`,
  });

  const resp = await fetch(tokenUrl, { method: "POST", body });
  if (!resp.ok) {
    throw new Error(
      `Dataverse token error: ${resp.status} ${await resp.text()}`
    );
  }

  const data = (await resp.json()) as TokenResponse;
  cachedToken = { token: data.access_token, exp: now + data.expires_in };
  return data.access_token;
}

/**
 * Fait un appel REST à Dataverse
 * @param path chemin API (ex: /new_subscriptions?$filter=...)
 * @param init options fetch (method, body, etc.)
 */
export async function dvRequest(path: string, init: any = {}) {
  const token = await getDataverseToken();
  const base = process.env.DATAVERSE_URL!;
  const url = `${base}/api/data/v9.2${path}`;

  const resp = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });

  if (!resp.ok) {
    throw new Error(`Dataverse API error: ${resp.status} ${await resp.text()}`);
  }

  if (resp.status === 204) return null;
  return resp.json();
}

/**
 * Cherche une subscription Dataverse par StripeSubscriptionID
 */
export async function findDvSubscriptionByStripeId(
  stripeSubId: string,
  dvPrefix: string = getDvPrefix()
) {
  const tableName = `${dvPrefix}subscriptions`;
  const result = await dvRequest(
    `/${tableName}?$select=${dvPrefix}subscriptionid,${dvPrefix}name,${dvPrefix}stripesubscriptionid&$filter=${dvPrefix}stripesubscriptionid eq '${stripeSubId}'`
  );
  return result.value?.[0] ?? null;
}

/**
 * Met à jour une subscription dans Dataverse
 */
export async function patchDvSubscription(
  dvId: string,
  payload: any,
  dvPrefix: string = getDvPrefix()
) {
  const tableName = `${dvPrefix}subscriptions`;
  await dvRequest(`/${tableName}(${dvId})`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Mappe un statut Stripe vers un statut Dataverse
 */
export function mapStripeStatus(
  stripeStatus: string
): "Active" | "PastDue" | "Cancelled" | "Incomplete" {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "Active";
  if (stripeStatus === "past_due" || stripeStatus === "unpaid")
    return "PastDue";
  if (stripeStatus === "canceled") return "Cancelled";
  return "Incomplete";
}

/**
 * Crée un lead dans Dataverse (si configuration disponible)
 */
export async function createDvLead(params: {
  leadName?: string;
  email: string;
  companyName?: string;
}): Promise<any> {
  const { email, leadName, companyName } = params;

  // Vérifie la configuration minimale
  if (
    !process.env.DATAVERSE_URL ||
    !process.env.DATAVERSE_TENANT_ID ||
    !process.env.DATAVERSE_CLIENT_ID ||
    !process.env.DATAVERSE_CLIENT_SECRET
  ) {
    throw new Error("Dataverse not configured");
  }

  const dvPrefix = getDvPrefix();
  const tableName = `${dvPrefix}leads`;

  const payload: Record<string, any> = {};
  payload[`${dvPrefix}leadname`] = leadName || companyName || email;
  payload[`${dvPrefix}email`] = email;
  if (companyName) payload[`${dvPrefix}companyname`] = companyName;

  return dvRequest(`/${tableName}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
