export function validateAllowedClientUrl(
  candidate: unknown,
  allowedUrls: string[]
): string | undefined {
  if (typeof candidate !== "string") return undefined;
  return allowedUrls.includes(candidate) ? candidate : undefined;
}
