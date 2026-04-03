import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, In, Repository, type FindOptionsWhere } from "typeorm";
import { ErrorCode, type OfficeListQuery } from "@clinio/shared";
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

  async findAll(query: OfficeListQuery, search?: string): Promise<{ items: OfficeEntity[]; total: number }> {
    let where: FindOptionsWhere<OfficeEntity> | FindOptionsWhere<OfficeEntity>[];
    if (search) {
      const pattern = ILike(`%${search}%`);
      where = [{ name: pattern }, { specialization: pattern }];
    } else {
      where = {};
    }

    const [items, total] = await this.officeRepository.findAndCount({
      where,
      relations: ["staff"],
      order: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return { items, total };
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

    const staff = staffIds.length ? await this.userRepository.findBy({ id: In(staffIds) }) : [];

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
    office.staff = staffIds.length ? await this.userRepository.findBy({ id: In(staffIds) }) : [];

    return this.officeRepository.save(office);
  }

  async update(id: string, dto: UpdateOfficeDto): Promise<OfficeEntity> {
    const office = await this.findById(id);

    const { staffIds, ...rest } = dto;

    Object.assign(office, rest);

    if (staffIds !== undefined) {
      office.staff = staffIds.length ? await this.userRepository.findBy({ id: In(staffIds) }) : [];
    }

    return this.officeRepository.save(office);
  }

  async remove(id: string): Promise<void> {
    await this.officeRepository.delete(id);
  }
}
