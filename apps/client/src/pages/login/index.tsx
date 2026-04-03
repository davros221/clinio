import {
  Paper,
  Text,
  Container,
  Box,
  Transition,
  Stack,
  Group,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { LoginPanel, type LoginPanelRef } from "./LoginPanel";
import { SignUpPanel } from "./SignUpPanel";
import { useAuthStore } from "../../stores/authStore.ts";
import { LanguageSwitcher } from "../../components/LanguageSwitcher.tsx";

export const Login = () => {
  const loginPanelRef = useRef<LoginPanelRef>(null);
  const loginRef = useRef<HTMLDivElement>(null);

  const logout = useAuthStore((store) => store.logout);

  const [showSignUp, setShowSignUp] = useState(false);
  const signUpRef = useRef<HTMLDivElement>(null);
  const showSignUpRef = useRef(showSignUp);

  const [containerHeight, setContainerHeight] = useState<number>(0);

  // Ensure user is logged out when visiting login page
  // TODO add logged guard to route user automatically to /dashboard if already logged in
  // TODO add instead /logout route that will logout() user and redirect to /login, and remove this useEffect
  useEffect(() => {
    logout();
  }, [logout]);

  useEffect(() => {
    showSignUpRef.current = showSignUp;
  }, [showSignUp]);

  useEffect(() => {
    const update = () => {
      const el = showSignUpRef.current ? signUpRef.current : loginRef.current;
      if (el) setContainerHeight(el.scrollHeight);
    };

    const observer = new ResizeObserver(update);
    if (loginRef.current) observer.observe(loginRef.current);
    if (signUpRef.current) observer.observe(signUpRef.current);

    requestAnimationFrame(update);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const el = showSignUp ? signUpRef.current : loginRef.current;
      if (el) setContainerHeight(el.scrollHeight);
    });
    return () => cancelAnimationFrame(raf);
  }, [showSignUp]);

  const handleSignUpSuccess = (signedUpEmail: string) => {
    loginPanelRef.current?.prefillEmail(signedUpEmail);
    setShowSignUp(false);
  };

  return (
    <Container size={420} w="100%">
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="md"
        style={{ overflow: "hidden" }}
      >
        <Stack>
          <Group justify="space-between" align="start">
            <Text size="lg" fw={700} mb="xl" c="blue">
              ClinIO
            </Text>

            <LanguageSwitcher />
          </Group>
        </Stack>

        <Box
          style={{
            position: "relative",
            height: containerHeight || "auto",
            transition: "height 300ms ease",
            overflow: "hidden",
          }}
        >
          <Transition
            mounted={!showSignUp}
            transition="slide-right"
            duration={300}
            timingFunction="ease"
            keepMounted
          >
            {(styles) => (
              <Box
                ref={loginRef}
                style={{
                  ...styles,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              >
                <LoginPanel
                  ref={loginPanelRef}
                  onSignUp={() => setShowSignUp(true)}
                />
              </Box>
            )}
          </Transition>

          <Transition
            mounted={showSignUp}
            transition="slide-left"
            duration={300}
            timingFunction="ease"
            keepMounted
          >
            {(styles) => (
              <Box
                ref={signUpRef}
                style={{
                  ...styles,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              >
                <SignUpPanel onSuccess={handleSignUpSuccess} />
              </Box>
            )}
          </Transition>
        </Box>
      </Paper>
    </Container>
  );
};
