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

  /**
   * ToDo: Constraints:
   * - CLIENT: can see only his own reservations
   * - NURSE / DOCTOR: Can see only reservations for his office
   *
   * ToDo: Find by USER ID or OFFICE ID
   *
   * ToDo: Add FROM and TO params
   */
  findAll(): Promise<AppointmentEntity[]> {
    return this.appointmentRepository.find({ relations: ["office"] });
  }

  /**
   * ToDo: Constraints:
   * - CLIENT: can see only his own reservations
   * - NURSE / DOCTOR: Can see only reservations for his office
   */
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

  /**
   * ToDo: Constraints:
   * - NURSE / DOCTOR: Can create only appointment for own office
   */
  async create(dto: CreateAppointmentDto): Promise<AppointmentEntity> {
    const entity = this.appointmentRepository.create(dto);
    return this.appointmentRepository.save(entity);
  }
}
