import type { Patient, CreatePatientDto } from "../types/patient";

// Simuluje zpoždění sítě (BE potřebuje čas na odpověď)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createPatient = async (
  data: CreatePatientDto
): Promise<Patient> => {
  await delay(800);

  // Simulujeme že BE vrátil nového pacienta s vygenerovaným id
  return {
    id: crypto.randomUUID(),
    ...data,
  };
};
