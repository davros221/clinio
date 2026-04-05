import { UserService } from "@clinio/api";
import type { CreatePatientDto } from "../types/patient";

export const createPatient = async (data: CreatePatientDto) => {
  const { data: patient, error } = await UserService.create({
    body: {
      ...data,
      role: "CLIENT",
    } as any,
  });

  if (error) throw error;

  return patient;
};
