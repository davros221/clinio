export type Patient = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthNumber: string;
  birthdate: string; // ← bylo dateOfBirth
  phone: string;
};

export type CreatePatientDto = {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  birthNumber: string;
  birthdate: string; // ← bylo dateOfBirth
  phone: string;
};
