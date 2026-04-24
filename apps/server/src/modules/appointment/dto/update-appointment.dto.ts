import { updateAppointmentSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class UpdateAppointmentDto extends createZodDto(
  updateAppointmentSchema
) {}
