import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErrorCode } from "@clinio/shared";
import { OfficeEntity } from "./office.entity";
import { CreateOfficeDto } from "./dto/create-office.dto";
import { internalError, notFound } from "../../common/error-messages";

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(OfficeEntity)
    private officeRepository: Repository<OfficeEntity>
  ) {}

  findAll(): Promise<OfficeEntity[]> {
    return this.officeRepository.find();
  }

  async findById(id: string): Promise<OfficeEntity> {
    let office: OfficeEntity | null;

    try {
      office = await this.officeRepository.findOneBy({ id });
    } catch {
      throw internalError();
    }

    if (!office) {
      throw notFound("Office", ErrorCode.OFFICE_NOT_FOUND);
    }

    return office;
  }

  async create(dto: CreateOfficeDto): Promise<OfficeEntity> {
    const entity = this.officeRepository.create(dto);
    return this.officeRepository.save(entity);
  }

  async remove(id: string): Promise<void> {
    await this.officeRepository.delete(id);
  }
}
