export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  birthNumber: string;
  dateOfBirth: string;
  email: string;
  phone: string;
};

export type CreatePatientDto = {
  firstName: string;
  lastName: string;
  birthNumber: string;
  dateOfBirth: string;
  email: string;
  phone: string;
};
