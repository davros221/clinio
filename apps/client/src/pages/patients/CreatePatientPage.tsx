import { Container } from "@mantine/core";
import { PatientForm } from "../../components/patients/PatientForm";

export const CreatePatientPage = () => {
  return (
    <Container py="xl">
      <PatientForm />
    </Container>
  );
};
