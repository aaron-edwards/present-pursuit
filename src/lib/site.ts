import { headers } from "next/headers";

export function getOriginFromHeaders(
  headerStore: Pick<Headers, "get">,
): string {
  const host =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "localhost:3000";
  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return `${protocol}://${host}`;
}

export async function getBaseUrl(): Promise<string> {
  const headerStore = await headers();

  return getOriginFromHeaders(headerStore);
}
