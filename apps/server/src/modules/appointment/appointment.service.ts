import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, Not, Repository, type FindOptionsWhere } from "typeorm";
import { type AppointmentListQuery, AppointmentStatus } from "@clinio/shared";

import { AppointmentEntity } from "./appointment.entity";
import { PatientEntity } from "../patient/patient.entity";
import { OfficeEntity } from "../office/office.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { RescheduleAppointmentDto } from "./dto/reschedule-appointment.dto";
import {
  appointmentAlreadyCompleted,
  appointmentNotEditable,
  appointmentNotFound,
  appointmentOutsideHours,
  appointmentSlotTaken,
  badRequest,
  forbidden,
  internalError,
  notFound,
  patientProfileIncomplete,
} from "../../common/error-messages";
import { AuthUser } from "../../auth/strategies/jwt.strategy";
import { AuthHelper } from "../../common/helpers/AuthHelper";
import { OfficeHoursHelper } from "../../common/helpers/OfficeHoursHelper";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentRepository: Repository<AppointmentEntity>,
    @InjectRepository(PatientEntity)
    private patientRepository: Repository<PatientEntity>,
    @InjectRepository(OfficeEntity)
    private officeRepository: Repository<OfficeEntity>
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

    const office = await this.officeRepository.findOne({
      where: { id: dto.officeId },
      relations: ["staff"],
    });
    if (!office) {
      throw notFound("Office");
    }

    if (isStaff) {
      AuthHelper.assertStaffBelongsToOfficeEntity(office, currentUser.id);

      if (!dto.patientId) {
        throw badRequest("patientId is required for staff");
      }
    }

    this.assertWithinOfficeHours(office, dto.date, dto.hour);
    await this.assertSlotAvailable(dto.officeId, dto.date, dto.hour);

    if (isPatient) {
      const patient = await this.patientRepository.findOne({
        where: { userId: currentUser.id },
      });

      if (!patient) {
        throw notFound("Patient");
      }

      if (!patient.birthNumber || !patient.birthdate || !patient.phone) {
        throw patientProfileIncomplete();
      }

      dto.patientId = patient.id;
    }

    const entity = this.appointmentRepository.create(dto);
    return this.appointmentRepository.save(entity);
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
    currentUser: AuthUser
  ): Promise<AppointmentEntity> {
    const appointment = await this.findByIdOrThrow(id);

    const { isStaff } = AuthHelper.getRoles(currentUser);
    if (!isStaff) {
      throw forbidden();
    }

    await AuthHelper.assertStaffBelongsToOffice(
      this.officeRepository,
      currentUser.id,
      appointment.officeId
    );

    if (
      dto.status !== undefined &&
      appointment.status !== AppointmentStatus.PLANNED
    ) {
      throw appointmentNotEditable();
    }

    Object.assign(appointment, dto);
    return this.appointmentRepository.save(appointment);
  }

  async reschedule(
    id: string,
    dto: RescheduleAppointmentDto,
    currentUser: AuthUser
  ): Promise<AppointmentEntity> {
    const appointment = await this.findByIdOrThrow(id);
    await this.assertAccess(appointment, currentUser);

    if (appointment.status !== AppointmentStatus.PLANNED) {
      throw appointmentNotEditable();
    }

    const office = await this.officeRepository.findOne({
      where: { id: appointment.officeId },
    });
    if (!office) {
      throw notFound("Office");
    }

    this.assertWithinOfficeHours(office, dto.date, dto.hour);
    await this.assertSlotAvailable(
      appointment.officeId,
      dto.date,
      dto.hour,
      id
    );

    appointment.date = dto.date;
    appointment.hour = dto.hour;
    return this.appointmentRepository.save(appointment);
  }

  async cancel(id: string, currentUser: AuthUser): Promise<AppointmentEntity> {
    const appointment = await this.findByIdOrThrow(id);
    await this.assertAccess(appointment, currentUser);

    if (appointment.status !== AppointmentStatus.PLANNED) {
      throw appointmentNotEditable();
    }

    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string, currentUser: AuthUser): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw appointmentNotFound();
    }

    const { isStaff } = AuthHelper.getRoles(currentUser);
    if (!isStaff) {
      throw forbidden();
    }

    await AuthHelper.assertStaffBelongsToOffice(
      this.officeRepository,
      currentUser.id,
      appointment.officeId
    );

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw appointmentAlreadyCompleted();
    }

    await this.appointmentRepository.delete(id);
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
      throw notFound("Patient");
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

  private assertWithinOfficeHours(
    office: OfficeEntity,
    date: string,
    hour: number
  ): void {
    const slots = OfficeHoursHelper.getSlotsForDate(
      office.officeHoursTemplate,
      date
    );

    if (!OfficeHoursHelper.isHourOpen(slots, hour)) {
      throw appointmentOutsideHours();
    }
  }

  private async assertSlotAvailable(
    officeId: string,
    date: string,
    hour: number,
    excludeId?: string
  ): Promise<void> {
    const existing = await this.appointmentRepository.findOne({
      where: { officeId, date, hour, status: Not(AppointmentStatus.CANCELLED) },
    });

    if (existing && existing.id !== excludeId) {
      throw appointmentSlotTaken();
    }
  }

  private async findByIdOrThrow(id: string): Promise<AppointmentEntity> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw appointmentNotFound();
    }

    return appointment;
  }
}
