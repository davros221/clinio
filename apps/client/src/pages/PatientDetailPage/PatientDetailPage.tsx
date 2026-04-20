import { Avatar, Group, Paper } from "@mantine/core";
import styles from "./patientDetailpage.module.css";
import { PatientDetailInfoRow } from "./components/PatientDetailInfoRow.tsx";
import { usePatientDetailPage } from "./usePatientDetailPage.ts";

export const PatientDetailPage = () => {
  const { info, isFetching } = usePatientDetailPage();

  return (
    <div>
      <Paper shadow={"xs"} p={"xl"}>
        <Group gap={32}>
          <Avatar size={"xl"} />
          <div className={styles.patientGrid}>
            {info.map((item) => (
              <PatientDetailInfoRow
                title={item.title}
                value={item.value}
                loading={isFetching}
                key={item.title}
              />
            ))}
          </div>
        </Group>
      </Paper>
      Medical records:
    </div>
  );
};
