import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OfficeController } from "./office.controller";
import { OfficeService } from "./office.service";
import { OfficeEntity } from "./office.entity";

@Module({
  imports: [TypeOrmModule.forFeature([OfficeEntity])],
  controllers: [OfficeController],
  providers: [OfficeService],
  exports: [OfficeService],
})
export class OfficeModule {}
