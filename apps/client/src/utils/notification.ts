import { notifications } from "@mantine/notifications";

export const notify = (title: string, message: string, color: string) => {
  notifications.show({
    title,
    message,
    color,
  });
};

export const notifyInfo = (title: string, message: string) => {
  notify(title, message, "blue");
};

export const notifyError = (title: string, message: string) => {
  notify(title, message, "red");
};

export const notifySuccess = (title: string, message: string) => {
  notify(title, message, "green");
};

interface NestValidationError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

interface ServerError {
  errorCode: string;
  message: string;
}

function isServerError(error: unknown): error is ServerError {
  return (
    typeof error === "object" &&
    error !== null &&
    "errorCode" in error &&
    "message" in error
  );
}

function isNestValidationError(error: unknown): error is NestValidationError {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const maybeError = error as { statusCode?: unknown; message?: unknown };
  const hasStatusCode = typeof maybeError.statusCode === "number";
  const msg = maybeError.message;
  const hasMessage =
    typeof msg === "string" ||
    (Array.isArray(msg) && msg.every((item) => typeof item === "string"));
  return hasStatusCode && hasMessage;
}

export const mapApiErrorToNotification = (error: unknown) => {
  // TODO add specific error handling based on the errorCode and statusCode
  // TODO there is shared package in packages/shared/src/errors/error-code that defines them
  if (isServerError(error)) {
    notifyError("Error", error.message);
  } else if (isNestValidationError(error)) {
    const message =
      typeof error.message === "string"
        ? error.message
        : error.message.join("; ");
    const title = error.statusCode === 400 ? "Validation Error" : "Error";
    notifyError(title, message);
  } else {
    notifyError("Error", "An unexpected error occurred");
  }
};

export const mapSystemErrorToNotification = (error: unknown) => {
  notifyError("System Error", String(error));
};
