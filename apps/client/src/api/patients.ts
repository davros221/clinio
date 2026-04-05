import { UserService } from "@clinio/api";
import type { Patient, CreatePatientDto } from "../types/patient";

export const createPatient = async (
  data: CreatePatientDto
): Promise<Patient> => {
  const response = await UserService.create({
    body: {
      ...data,
      role: "CLIENT",
    },
  });
  return response.data as Patient;
};
