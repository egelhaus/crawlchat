export function getClientIp(req: Request) {
  const headers = req.headers;
  return headers.get("x-forwarded-for") || headers.get("x-real-ip");
}
