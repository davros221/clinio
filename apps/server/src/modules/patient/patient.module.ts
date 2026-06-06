import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientController } from "./patient.controller";
import { PatientService } from "./patient.service";
import { PatientEntity } from "./patient.entity";
import { UserEntity } from "../user/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PatientEntity, UserEntity])],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
