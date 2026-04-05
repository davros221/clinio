import {
  TextInput,
  PasswordInput,
  Anchor,
  Title,
  Button,
  Stack,
  Center,
  Group,
} from "@mantine/core";
import { FormEvent, useState } from "react";
import { useT } from "../../hooks/useT.ts";
import { UserService } from "@clinio/api";
import {
  mapApiErrorToNotification,
  mapSystemErrorToNotification,
  notifySuccess,
} from "../../utils/notification.ts";
import { USER_ROLES } from "../../types/user.ts";
import { useLogin } from "../../hooks/useLogin.ts";

interface SignUpPanelProps {
  onSuccess: (email: string) => void;
  onBack: () => void;
}

export const SignUpPanel = ({ onSuccess, onBack }: SignUpPanelProps) => {
  const t = useT();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [birthNumber, setBirthNumber] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { mutateAsync } = useLogin();

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const passwordError =
    password.length > 0 && !passwordRegex.test(password)
      ? t("signUp.passwordError")
      : undefined;

  const passwordsMatch =
    password.length === 0 ||
    passwordConfirm.length === 0 ||
    password === passwordConfirm;

  const isValid =
    email &&
    firstName &&
    lastName &&
    password &&
    !passwordError &&
    passwordConfirm &&
    password === passwordConfirm &&
    birthNumber &&
    birthdate &&
    phone;

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);
    try {
      const { error } = await UserService.create({
        body: {
          email,
          firstName,
          lastName,
          password,
          role: USER_ROLES.CLIENT,
          birthNumber,
          birthdate,
          phone,
        } as any,
      });

      if (error && typeof error === "object") {
        mapApiErrorToNotification(error);
        return;
      }

      notifySuccess(t("signUp.successTitle"), t("signUp.successMessage"));
      await mutateAsync({ email, password });
      onSuccess(email);
    } catch (networkError) {
      mapSystemErrorToNotification(networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title ta="center" c="blue" order={1} mb="xl">
        {t("signUp.title")}
      </Title>

      <form onSubmit={handleSignUp}>
        <Stack>
          <TextInput
            placeholder={t("signUp.emailPlaceholder")}
            label={t("signUp.emailLabel")}
            radius="md"
            size="md"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />

          <Group grow>
            <TextInput
              placeholder={t("signUp.firstNamePlaceholder")}
              label={t("signUp.firstNameLabel")}
              radius="md"
              size="md"
              value={firstName}
              onChange={(e) => setFirstName(e.currentTarget.value)}
            />
            <TextInput
              placeholder={t("signUp.lastNamePlaceholder")}
              label={t("signUp.lastNameLabel")}
              radius="md"
              size="md"
              value={lastName}
              onChange={(e) => setLastName(e.currentTarget.value)}
            />
          </Group>

          <TextInput
            placeholder={t("signUp.birthNumberPlaceholder")}
            label={t("signUp.birthNumberLabel")}
            radius="md"
            size="md"
            value={birthNumber}
            onChange={(e) => setBirthNumber(e.currentTarget.value)}
          />

          <TextInput
            placeholder={t("signUp.birthdatePlaceholder")}
            label={t("signUp.birthdateLabel")}
            type="date"
            radius="md"
            size="md"
            value={birthdate}
            onChange={(e) => setBirthdate(e.currentTarget.value)}
          />

          <TextInput
            placeholder={t("signUp.phonePlaceholder")}
            label={t("signUp.phoneLabel")}
            radius="md"
            size="md"
            value={phone}
            onChange={(e) => setPhone(e.currentTarget.value)}
          />

          <PasswordInput
            placeholder={t("signUp.passwordPlaceholder")}
            label={t("signUp.passwordLabel")}
            radius="md"
            size="md"
            value={password}
            error={passwordError}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          <PasswordInput
            placeholder={t("signUp.confirmPasswordPlaceholder")}
            label={t("signUp.confirmPasswordLabel")}
            radius="md"
            size="md"
            value={passwordConfirm}
            error={!passwordsMatch ? t("signUp.passwordsMismatch") : undefined}
            onChange={(e) => setPasswordConfirm(e.currentTarget.value)}
          />
        </Stack>

        <Button
          fullWidth
          mt="xl"
          variant="outline"
          radius="xl"
          size="md"
          type="submit"
          disabled={!isValid}
          loading={loading}
        >
          {t("signUp.submitButton")}
        </Button>
      </form>

      <Center mt="md">
        <Anchor component="button" size="sm" c="dimmed" onClick={onBack}>
          {t("signUp.backToLogin")}
        </Anchor>
      </Center>
    </>
  );
};
