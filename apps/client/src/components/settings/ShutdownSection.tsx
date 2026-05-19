import { useState } from "react";
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
import { useT, useUser } from "@hooks";
import { useShutdownMutation } from "@api";
import { ROUTER_PATHS } from "@router";
import { notifyError, notifySuccess } from "@utils";

const MAX_ATTEMPTS = 3;

type Step = "confirm" | "password";

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
  const { logout } = useUser();
  const { mutate: shutdown, isPending } = useShutdownMutation();

  const [step, setStep] = useState<Step>("confirm");
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState(0);

  const reset = () => {
    setStep("confirm");
    setPassword("");
    setAttempts(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
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
      onError: () => {
        const next = attempts + 1;
        if (next >= MAX_ATTEMPTS) {
          notifyError(
            t("settings.shutdown.tooManyAttemptsTitle"),
            t("settings.shutdown.tooManyAttemptsMessage")
          );
          reset();
          onClose();
          logout();
        } else {
          setAttempts(next);
          setPassword("");
        }
      },
    });
  };

  const remaining = MAX_ATTEMPTS - attempts;
  const showAttemptsError = attempts > 0;

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
              error={
                showAttemptsError
                  ? t("settings.shutdown.passwordError", { count: remaining })
                  : null
              }
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
                disabled={!password}
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
