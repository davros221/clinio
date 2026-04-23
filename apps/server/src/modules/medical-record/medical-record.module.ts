import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedicalRecordController } from "./medical-record.controller";
import { MedicalRecordService } from "./medical-record.service";
import { MedicalRecordEntity } from "./medical-record.entity";
import { OfficeEntity } from "../office/office.entity";
import { PatientEntity } from "../patient/patient.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalRecordEntity,
      OfficeEntity,
      PatientEntity,
    ]),
  ],
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService],
  exports: [MedicalRecordService],
})
export class MedicalRecordModule {}
