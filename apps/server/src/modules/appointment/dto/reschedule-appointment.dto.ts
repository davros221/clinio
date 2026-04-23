import { rescheduleAppointmentSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class RescheduleAppointmentDto extends createZodDto(
  rescheduleAppointmentSchema
) {}
