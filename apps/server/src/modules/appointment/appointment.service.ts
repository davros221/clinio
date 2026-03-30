import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { AppointmentEntity } from "./appointment.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import {
  appointmentNotFound,
  internalError,
} from "../../common/error-messages";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentRepository: Repository<AppointmentEntity>
  ) {}

  findAll(): Promise<AppointmentEntity[]> {
    return this.appointmentRepository.find({ relations: ["office"] });
  }

  async findById(id: string): Promise<AppointmentEntity> {
    let appointment: AppointmentEntity | null;

    try {
      appointment = await this.appointmentRepository.findOne({
        where: { id },
        relations: ["office"],
      });
    } catch {
      throw internalError();
    }

    if (!appointment) {
      throw appointmentNotFound();
    }

    return appointment;
  }

  async create(dto: CreateAppointmentDto): Promise<AppointmentEntity> {
    const entity = this.appointmentRepository.create({
      ...dto,
      datetime: new Date(dto.datetime),
    });
    return this.appointmentRepository.save(entity);
  }
}
