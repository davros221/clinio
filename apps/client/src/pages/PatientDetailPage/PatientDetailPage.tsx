import {
  Avatar,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { useParams } from "react-router";
import styles from "./patientDetailpage.module.css";
import { PatientDetailInfoRow } from "./components/PatientDetailInfoRow.tsx";
import { usePatientDetailPage } from "./usePatientDetailPage.ts";
import { DataTable } from "../../components/DataTable/DataTable.tsx";
import { CreateMedicalRecordModal } from "../../components/medicalRecord/CreateMedicalRecordModal.tsx";
import { MedicalRecordDetailModal } from "../../components/medicalRecord/MedicalRecordDetailModal.tsx";
import { useGetPatientMedicalRecordsQuery } from "@api";
import { useT } from "@hooks";
import { MedicalRecord } from "@clinio/api";

function formatDate(raw: string): string {
  return new Date(raw).toLocaleDateString();
}

function formatText(value: string | null | undefined): string {
  return value ?? "—";
}

export const PatientDetailPage = () => {
  const { info, isFetching } = usePatientDetailPage();
  const { id: patientId } = useParams();
  const t = useT();

  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );

  const {
    data: medicalRecords = [],
    isLoading,
    isFetching: isFetchingRecords,
    isError,
    error,
  } = useGetPatientMedicalRecordsQuery(patientId!);

  const handleRowClick = (row: MedicalRecord) => {
    setSelectedRecord(row);
    openDetail();
  };

  const columns = [
    {
      key: "createdAt",
      header: t("medicalRecord.overview.table.date"),
      render: (row: MedicalRecord) => formatDate(row.createdAt),
    },
    {
      key: "createdBy",
      header: t("medicalRecord.overview.table.createdBy"),
      render: (row: MedicalRecord) => (
        <Text truncate="end" maw={220}>
          {`${row.creator.firstName} ${row.creator.lastName}`}
        </Text>
      ),
    },
    {
      key: "examinationSummary",
      header: t("medicalRecord.overview.table.examinationSummary"),
      render: (row: MedicalRecord) => (
        <Text truncate="end" maw={220}>
          {formatText(row.examinationSummary)}
        </Text>
      ),
    },
    {
      key: "diagnosis",
      header: t("medicalRecord.overview.table.diagnosis"),
      render: (row: MedicalRecord) => (
        <Text truncate="end" maw={220}>
          {formatText(row.diagnosis)}
        </Text>
      ),
    },
  ];

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

      <Stack mt="xl" gap="md">
        <Group justify="space-between">
          <Title order={4}>{t("medicalRecord.overview.title")}</Title>
          <Button onClick={openCreate}>
            {t("medicalRecord.overview.createButton")}
          </Button>
        </Group>

        <DataTable
          data={medicalRecords}
          columns={columns}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetchingRecords}
          isError={isError}
          error={error}
          onRowClick={handleRowClick}
        />
      </Stack>

      {patientId && (
        <CreateMedicalRecordModal
          patientId={patientId}
          opened={createOpened}
          onClose={closeCreate}
        />
      )}

      <MedicalRecordDetailModal
        record={selectedRecord}
        opened={detailOpened}
        onClose={closeDetail}
      />
    </div>
  );
};
