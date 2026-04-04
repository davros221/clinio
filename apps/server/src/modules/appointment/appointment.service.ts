import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, Repository, type FindOptionsWhere } from "typeorm";
import {
  type AppointmentListQuery,
  type AppointmentStatus,
} from "@clinio/shared";

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
  async findAll(
    query: AppointmentListQuery,
    statuses?: AppointmentStatus[]
  ): Promise<{ items: AppointmentEntity[]; total: number }> {
    const where: FindOptionsWhere<AppointmentEntity> = {};
    if (statuses?.length) {
      where.status = In(statuses);
    }

    const [items, total] = await this.appointmentRepository.findAndCount({
      where,
      relations: ["office"],
      order: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return { items, total };
  }

  async findByOfficeAndWeek(
    officeId: string,
    weekStart: Date
  ): Promise<AppointmentEntity[]> {
    const startDate = weekStart.toISOString().slice(0, 10);
    const endDate = new Date(weekStart.getTime() + 6 * 86400000)
      .toISOString()
      .slice(0, 10);

    return this.appointmentRepository.find({
      where: {
        officeId,
        date: Between(startDate, endDate),
      },
    });
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
