import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { OfficeService } from "../office.service";
import { OfficeEntity } from "../office.entity";
import { ErrorCode } from "@clinio/shared";
import { CreateOfficeDto } from "../dto/create-office.dto";

const mockOffice: OfficeEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Main Office",
  specialization: "General",
  address: "123 Main St",
  officeHoursTemplate: {
    monday: [{ from: 9, to: 17 }],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  },
  doctors: [],
  nurses: [],
};

const mockRepository = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe("OfficeService", () => {
  let service: OfficeService;
  let repository: jest.Mocked<
    Pick<
      Repository<OfficeEntity>,
      "find" | "findOneBy" | "create" | "save" | "delete"
    >
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficeService,
        {
          provide: getRepositoryToken(OfficeEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OfficeService>(OfficeService);
    repository = module.get(getRepositoryToken(OfficeEntity));
  });

  describe("findAll", () => {
    it("should return all offices", async () => {
      repository.find.mockResolvedValue([mockOffice]);

      const result = await service.findAll();

      expect(result).toEqual([mockOffice]);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe("findById", () => {
    it("should return office when found", async () => {
      repository.findOneBy.mockResolvedValue(mockOffice);

      const result = await service.findById(mockOffice.id);

      expect(result).toEqual(mockOffice);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockOffice.id });
    });

    it("should throw NotFoundException when office not found", async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw NotFoundException with OFFICE_NOT_FOUND error code", async () => {
      repository.findOneBy.mockResolvedValue(null);

      try {
        await service.findById("non-existent-id");
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect((error as NotFoundException).getResponse()).toMatchObject({
          errorCode: ErrorCode.OFFICE_NOT_FOUND,
        });
      }
    });

    it("should throw InternalServerErrorException when repository throws", async () => {
      repository.findOneBy.mockRejectedValue(new Error("DB error"));

      try {
        await service.findById(mockOffice.id);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(
          (error as InternalServerErrorException).getResponse()
        ).toMatchObject({
          errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        });
      }
    });
  });

  describe("create", () => {
    const createDto: CreateOfficeDto = {
      name: "New Office",
      specialization: "Dermatology",
      address: "456 Oak Ave",
    };

    it("should create and return the saved entity", async () => {
      const saved = {
        ...mockOffice,
        ...createDto,
      } as OfficeEntity;
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      const result = await service.create(createDto);

      expect(result).toEqual(saved);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(saved);
    });
  });

  describe("remove", () => {
    it("should call repository.delete with the id", async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.remove(mockOffice.id);

      expect(repository.delete).toHaveBeenCalledWith(mockOffice.id);
    });
  });
});
