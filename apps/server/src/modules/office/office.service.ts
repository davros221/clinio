import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { ErrorCode } from "@clinio/shared";
import { OfficeEntity } from "./office.entity";
import { UserEntity } from "../user/user.entity";
import { CreateOfficeDto } from "./dto/create-office.dto";
import { UpdateOfficeDto } from "./dto/update-office.dto";
import { internalError, notFound } from "../../common/error-messages";

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(OfficeEntity)
    private officeRepository: Repository<OfficeEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  findAll(): Promise<OfficeEntity[]> {
    return this.officeRepository.find({ relations: ["staff"] });
  }

  async findById(id: string): Promise<OfficeEntity> {
    let office: OfficeEntity | null;

    try {
      office = await this.officeRepository.findOne({
        where: { id },
        relations: ["staff"],
      });
    } catch {
      throw internalError();
    }

    if (!office) {
      throw notFound("Office", ErrorCode.OFFICE_NOT_FOUND);
    }

    return office;
  }

  async create(dto: CreateOfficeDto): Promise<OfficeEntity> {
    const { staffIds, ...rest } = dto;

    const staff = staffIds.length
      ? await this.userRepository.findBy({ id: In(staffIds) })
      : [];

    const entity = this.officeRepository.create({ ...rest, staff });

    return this.officeRepository.save(entity);
  }

  async replace(id: string, dto: CreateOfficeDto): Promise<OfficeEntity> {
    const office = await this.findById(id);

    const { staffIds, ...rest } = dto;

    office.name = rest.name;
    office.specialization = rest.specialization;
    office.address = rest.address;
    office.officeHoursTemplate = rest.officeHoursTemplate;
    office.staff = staffIds.length
      ? await this.userRepository.findBy({ id: In(staffIds) })
      : [];

    return this.officeRepository.save(office);
  }

  async update(id: string, dto: UpdateOfficeDto): Promise<OfficeEntity> {
    const office = await this.findById(id);

    const { staffIds, ...rest } = dto;

    Object.assign(office, rest);

    if (staffIds !== undefined) {
      office.staff = staffIds.length
        ? await this.userRepository.findBy({ id: In(staffIds) })
        : [];
    }

    return this.officeRepository.save(office);
  }

  async remove(id: string): Promise<void> {
    await this.officeRepository.delete(id);
  }
}
