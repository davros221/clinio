import { Paper, Text, Container, Center, Box, Transition } from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { LoginPanel } from "./LoginPanel";
import { SignUpPanel } from "./SignUpPanel";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);

  const loginRef = useRef<HTMLDivElement>(null);
  const signUpRef = useRef<HTMLDivElement>(null);
  const showSignUpRef = useRef(showSignUp);
  const [containerHeight, setContainerHeight] = useState<number>(0);

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

  const handleSignUpSuccess = (signedUpEmail: string, _password: string) => {
    setEmail(signedUpEmail);
    setShowSignUp(false);
  };

  return (
    <Center h="100dvh">
      <Container size={420} w="100%">
        <Paper
          withBorder
          shadow="md"
          p={40}
          radius="md"
          style={{ overflow: "hidden" }}
        >
          <Text size="lg" fw={700} mb="xl" c="blue">
            ClinIO
          </Text>

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
                    email={email}
                    password={password}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
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
                  <SignUpPanel
                    onSuccess={handleSignUpSuccess}
                    onBack={() => setShowSignUp(false)}
                  />
                </Box>
              )}
            </Transition>
          </Box>
        </Paper>
      </Container>
    </Center>
  );
};
