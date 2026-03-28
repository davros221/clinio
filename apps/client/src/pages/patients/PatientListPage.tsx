import { Title, Stack } from "@mantine/core";
import {
  DataTable,
  DataTableColumn,
  DataTableAction,
} from "../../components/DataTable";
import { useT } from "../../hooks/useT";

type Patient = {
  id: string;
  lastName: string;
  firstName: string;
  birthNumber: string;
  birthDate: string;
  phone: string;
  email: string;
};

// TODO: nahradit za API volání až bude backend endpoint
const mockPatients: Patient[] = [
  {
    id: "1",
    lastName: "Novák",
    firstName: "Jan",
    birthNumber: "800101/1234",
    birthDate: "1. 1. 1980",
    phone: "+420 601 123 456",
    email: "jan.novak@email.cz",
  },
  {
    id: "2",
    lastName: "Svobodová",
    firstName: "Marie",
    birthNumber: "905512/5678",
    birthDate: "12. 5. 1990",
    phone: "+420 602 987 654",
    email: "marie.svobodova@email.cz",
  },
];

export const PatientListPage = () => {
  const t = useT();

  const columns: DataTableColumn<Patient>[] = [
    { key: "lastName", header: t("patients.columns.lastName") },
    { key: "firstName", header: t("patients.columns.firstName") },
    { key: "birthNumber", header: t("patients.columns.birthNumber") },
    { key: "birthDate", header: t("patients.columns.birthDate") },
    { key: "phone", header: t("patients.columns.phone") },
    { key: "email", header: t("patients.columns.email") },
  ];

  const actions: DataTableAction<Patient>[] = [
    {
      label: t("patients.actions.detail"),
      onClick: (patient) => console.log("Detail pacienta:", patient.id), // TODO: navigate na detail
    },
    {
      label: t("patients.actions.book"),
      variant: "filled",
      onClick: (patient) => console.log("Objednat pacienta:", patient.id), // TODO: navigate na vytvoření rezervace
    },
  ];

  return (
    <Stack>
      <Title>{t("patients.title")}</Title>
      <DataTable
        data={mockPatients}
        columns={columns}
        keyExtractor={(p) => p.id}
        actions={actions}
        emptyMessage={t("patients.emptyMessage")}
      />
    </Stack>
  );
};
