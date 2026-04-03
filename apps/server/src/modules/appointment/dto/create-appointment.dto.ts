import { createAppointmentSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class CreateAppointmentDto extends createZodDto(
  createAppointmentSchema
) {}
