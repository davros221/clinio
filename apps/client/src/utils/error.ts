import { isAxiosError } from "axios";
import { ErrorCode } from "@clinio/shared";

export function extractErrorCode(error: unknown): ErrorCode | null {
  if (isAxiosError(error)) {
    const code = error.response?.data?.errorCode;
    if (Object.values(ErrorCode).includes(code)) return code as ErrorCode;
  }
  if (typeof error === "object" && error !== null && "errorCode" in error) {
    const code = (error as { errorCode: unknown }).errorCode;
    if (Object.values(ErrorCode).includes(code as ErrorCode))
      return code as ErrorCode;
  }
  return null;
}
