import { SyntheticEvent, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { useT } from "@hooks";
import { useShutdownMutation } from "@api";
import { ROUTER_PATHS } from "@router";
import { extractErrorCode, notifySuccess } from "@utils";
import { ErrorCode } from "@clinio/shared";

type Step = "confirm" | "password";
type PasswordError =
  | { type: "wrongPassword" }
  | { type: "rateLimited"; retryAfterMinutes: number };

export const ShutdownSection = () => {
  const t = useT();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Alert color="red" title={t("settings.dangerZoneTitle")} maw={450}>
        <Stack gap="sm">
          <Text size="sm">{t("settings.dangerZoneDescription")}</Text>
          <Button color="red" variant="outline" onClick={() => setOpened(true)}>
            {t("settings.shutdownButton")}
          </Button>
        </Stack>
      </Alert>

      <ShutdownModal opened={opened} onClose={() => setOpened(false)} />
    </>
  );
};

type ShutdownModalProps = {
  opened: boolean;
  onClose: () => void;
};

const ShutdownModal = ({ opened, onClose }: ShutdownModalProps) => {
  const t = useT();
  const navigate = useNavigate();
  const { mutate: shutdown, isPending } = useShutdownMutation();

  const [step, setStep] = useState<Step>("confirm");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<PasswordError | null>(
    null
  );

  const reset = () => {
    setStep("confirm");
    setPassword("");
    setPasswordError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    shutdown(password, {
      onSuccess: () => {
        notifySuccess(
          t("settings.shutdown.successTitle"),
          t("settings.shutdown.successMessage")
        );
        reset();
        onClose();
        navigate(ROUTER_PATHS.SIGN_UP, { replace: true });
      },
      onError: (error) => {
        const code = extractErrorCode(error);
        setPassword("");

        if (code === ErrorCode.SHUTDOWN_RATE_LIMITED) {
          const minutes =
            (error as any)?.response?.data?.meta?.retryAfterMinutes ?? 60;
          setPasswordError({ type: "rateLimited", retryAfterMinutes: minutes });
        } else {
          setPasswordError({ type: "wrongPassword" });
        }
      },
    });
  };

  const getPasswordErrorMessage = () => {
    if (passwordError?.type === "rateLimited") {
      return t("settings.shutdown.rateLimitedError", {
        count: passwordError.retryAfterMinutes,
      });
    }
    if (passwordError?.type === "wrongPassword") {
      return t("settings.shutdown.wrongPasswordError");
    }
    return null;
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t("settings.shutdown.confirmTitle")}
      centered
      closeOnClickOutside={!isPending}
      closeOnEscape={!isPending}
      withCloseButton={!isPending}
    >
      {step === "confirm" ? (
        <Stack>
          <Text size="sm">{t("settings.shutdown.confirmMessage")}</Text>
          <Group justify="flex-end">
            <Button variant="outline" color="gray" onClick={handleClose}>
              {t("settings.shutdown.cancelLabel")}
            </Button>
            <Button color="red" onClick={() => setStep("password")}>
              {t("settings.shutdown.continueLabel")}
            </Button>
          </Group>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack>
            <PasswordInput
              autoFocus
              label={t("settings.shutdown.passwordLabel")}
              placeholder={t("settings.shutdown.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              disabled={passwordError?.type === "rateLimited"}
              error={getPasswordErrorMessage()}
            />
            <Group justify="flex-end">
              <Button
                variant="outline"
                color="gray"
                type="button"
                onClick={handleClose}
                disabled={isPending}
              >
                {t("settings.shutdown.cancelLabel")}
              </Button>
              <Button
                color="red"
                type="submit"
                loading={isPending}
                disabled={!password || passwordError?.type === "rateLimited"}
              >
                {t("settings.shutdown.confirmLabel")}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
};
