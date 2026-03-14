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

interface ValidationError {
  code: string;
  message: string;
}

interface ApiError {
  errors: ValidationError[];
}

interface ServerError {
  errorCode: string;
  message: string;
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as { errors: unknown }).errors)
  );
}

function isServerError(error: unknown): error is ServerError {
  return (
    typeof error === "object" &&
    error !== null &&
    "errorCode" in error &&
    "message" in error
  );
}

export const mapApiErrorToNotification = (error: unknown) => {
  if (isApiError(error)) {
    error.errors.forEach((err) => {
      notifyError("Validation Error", `${err.code}: ${err.message}`);
    });
  } else if (isServerError(error)) {
    notifyError("Error", error.message);
  } else {
    notifyError("Error", "An unexpected error occurred");
  }
};

export const mapSystemErrorToNotification = (error: unknown) => {
  notifyError("System Error", String(error));
};
