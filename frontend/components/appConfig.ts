
const browserApiBaseUrl =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000";



export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? browserApiBaseUrl;

export const CALL_WS_URL =
  process.env.NEXT_PUBLIC_CALL_WS_URL ??
  API_BASE_URL.replace(/^http/, "ws") + "/ws";
