import { getCalendarQuerySchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class GetCalendarQueryDto extends createZodDto(getCalendarQuerySchema) {}
