import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, Not, Repository, type FindOptionsWhere } from "typeorm";
import { type AppointmentListQuery, AppointmentStatus } from "@clinio/shared";

import { AppointmentEntity } from "./appointment.entity";
import { PatientEntity } from "../patient/patient.entity";
import { OfficeEntity } from "../office/office.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import {
  appointmentNotFound,
  appointmentOutsideHours,
  appointmentSlotTaken,
  badRequest,
  forbidden,
  internalError,
  notFound,
} from "../../common/error-messages";
import { AuthUser } from "../../auth/strategies/jwt.strategy";
import { AuthHelper } from "../../common/helpers/AuthHelper";
import { SettingsService } from "../../common/services/settings.service";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentRepository: Repository<AppointmentEntity>,
    @InjectRepository(PatientEntity)
    private patientRepository: Repository<PatientEntity>,
    @InjectRepository(OfficeEntity)
    private officeRepository: Repository<OfficeEntity>,
    private settingsService: SettingsService
  ) {}

  async findAll(
    query: AppointmentListQuery,
    currentUser: AuthUser,
    statuses?: AppointmentStatus[],
    officeId?: string
  ): Promise<{ items: AppointmentEntity[]; total: number }> {
    const { isPatient, isStaff } = AuthHelper.getRoles(currentUser);

    if (isPatient) {
      return this.findAllForPatient(query, currentUser, statuses);
    }

    if (isStaff) {
      if (!officeId) {
        throw forbidden();
      }
      await AuthHelper.assertStaffBelongsToOffice(
        this.officeRepository,
        currentUser.id,
        officeId
      );
      return this.findAllFiltered(query, statuses, officeId);
    }

    // Admin — no filtering
    return this.findAllFiltered(query, statuses);
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
      relations: ["patient", "patient.user"],
    });
  }

  async findById(
    id: string,
    currentUser: AuthUser
  ): Promise<AppointmentEntity> {
    let appointment: AppointmentEntity | null;

    try {
      appointment = await this.appointmentRepository.findOne({
        where: { id },
        relations: ["office", "patient", "patient.user"],
      });
    } catch {
      throw internalError();
    }

    if (!appointment) {
      throw appointmentNotFound();
    }

    await this.assertAccess(appointment, currentUser);

    return appointment;
  }

  async create(
    dto: CreateAppointmentDto,
    currentUser: AuthUser
  ): Promise<AppointmentEntity> {
    const { isStaff, isPatient } = AuthHelper.getRoles(currentUser);

    if (isStaff) {
      await AuthHelper.assertStaffBelongsToOffice(
        this.officeRepository,
        currentUser.id,
        dto.officeId
      );

      if (!dto.patientId) {
        throw badRequest("patientId is required for staff");
      }
    }

    await this.assertWithinOpeningHours(dto.hour);
    await this.assertSlotAvailable(dto.officeId, dto.date, dto.hour);

    if (isPatient) {
      const patient = await this.patientRepository.findOne({
        where: { userId: currentUser.id },
      });

      if (!patient) {
        throw notFound("Patient");
      }

      dto.patientId = patient.id;
    }

    const entity = this.appointmentRepository.create(dto);
    return this.appointmentRepository.save(entity);
  }

  private async findAllForPatient(
    query: AppointmentListQuery,
    currentUser: AuthUser,
    statuses?: AppointmentStatus[]
  ): Promise<{ items: AppointmentEntity[]; total: number }> {
    const patient = await this.patientRepository.findOne({
      where: { userId: currentUser.id },
    });

    if (!patient) {
      return { items: [], total: 0 };
    }

    const where: FindOptionsWhere<AppointmentEntity> = {
      patientId: patient.id,
    };
    if (statuses?.length) {
      where.status = In(statuses);
    }

    const [items, total] = await this.appointmentRepository.findAndCount({
      where,
      relations: ["office", "patient", "patient.user"],
      order: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return { items, total };
  }

  private async findAllFiltered(
    query: AppointmentListQuery,
    statuses?: AppointmentStatus[],
    officeId?: string
  ): Promise<{ items: AppointmentEntity[]; total: number }> {
    const where: FindOptionsWhere<AppointmentEntity> = {};
    if (officeId) {
      where.officeId = officeId;
    }
    if (statuses?.length) {
      where.status = In(statuses);
    }

    const [items, total] = await this.appointmentRepository.findAndCount({
      where,
      relations: ["office", "patient", "patient.user"],
      order: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return { items, total };
  }

  private async assertAccess(
    appointment: AppointmentEntity,
    currentUser: AuthUser
  ): Promise<void> {
    const { isPatient, isStaff } = AuthHelper.getRoles(currentUser);

    if (isPatient) {
      const patient = await this.patientRepository.findOne({
        where: { userId: currentUser.id },
      });

      if (appointment.patientId !== patient?.id) {
        throw forbidden();
      }
    }

    if (isStaff) {
      await AuthHelper.assertStaffBelongsToOffice(
        this.officeRepository,
        currentUser.id,
        appointment.officeId
      );
    }
  }

  private assertWithinOpeningHours(hour: number): void {
    const { startingHour, endingHour } = this.settingsService.getOpeningHours();

    if (hour < startingHour || hour >= endingHour) {
      throw appointmentOutsideHours();
    }
  }

  private async assertSlotAvailable(
    officeId: string,
    date: string,
    hour: number
  ): Promise<void> {
    const existing = await this.appointmentRepository.findOne({
      where: { officeId, date, hour, status: Not(AppointmentStatus.CANCELLED) },
    });

    if (existing) {
      throw appointmentSlotTaken();
    }
  }
}
