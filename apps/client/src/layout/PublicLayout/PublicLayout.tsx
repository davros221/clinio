import {
  Container,
  Group,
  Paper,
  PaperProps,
  Stack,
  Text,
} from "@mantine/core";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import styles from "./publicLayout.module.css";
import { usePublicLayout } from "./usePublicLayout.ts";
import { LanguageSwitcher } from "@components";
import { forwardRef } from "react";
import { APP_NAME } from "../../constants.ts";

const PaperComponent = forwardRef<HTMLDivElement, PaperProps>((props, ref) => {
  return <Paper ref={ref} {...props} />;
});

const MotionPaper = motion.create(PaperComponent);

export const PublicLayout = () => {
  const { outlet, location, contentAnimationProps } = usePublicLayout();

  return (
    <Container className={styles.container}>
      <LayoutGroup>
        <MotionPaper
          layout
          className={styles.authLayout}
          p={40}
          withBorder
          shadow={"md"}
          radius={"md"}
          transition={{ layout: { duration: 0.2 } }}
        >
          <Stack>
            <Group justify={"space-between"} align={"start"}>
              <Text size={"lg"} fw={700} mb={"xl"} c={"blue"}>
                {APP_NAME}
              </Text>
              <LanguageSwitcher />
            </Group>
          </Stack>
          <AnimatePresence mode={"wait"}>
            <motion.div key={location.pathname} {...contentAnimationProps}>
              {outlet}
            </motion.div>
          </AnimatePresence>
        </MotionPaper>
      </LayoutGroup>
    </Container>
  );
};
