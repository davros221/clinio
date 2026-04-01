import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { OfficeService } from "../office.service";
import { OfficeEntity } from "../office.entity";
import { UserEntity } from "../../user/user.entity";
import {
  ErrorCode,
  UserRole,
  OfficeSortField,
  SortOrder,
} from "@clinio/shared";
import { CreateOfficeDto } from "../dto/create-office.dto";
import { UpdateOfficeDto } from "../dto/update-office.dto";

const mockStaff: UserEntity = {
  id: "staff-1",
  email: "doc@example.com",
  password: "hashed",
  firstName: "Doc",
  lastName: "Tor",
  role: UserRole.DOCTOR,
};

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
  staff: [],
};

const defaultQuery = {
  page: 1,
  limit: 20,
  sortBy: OfficeSortField.NAME,
  sortOrder: SortOrder.ASC,
};

const mockOfficeRepository = () => ({
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockUserRepository = () => ({
  findBy: jest.fn(),
});

describe("OfficeService", () => {
  let service: OfficeService;
  let officeRepository: jest.Mocked<
    Pick<
      Repository<OfficeEntity>,
      "find" | "findAndCount" | "findOne" | "create" | "save" | "delete"
    >
  >;
  let userRepository: jest.Mocked<Pick<Repository<UserEntity>, "findBy">>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficeService,
        {
          provide: getRepositoryToken(OfficeEntity),
          useFactory: mockOfficeRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<OfficeService>(OfficeService);
    officeRepository = module.get(getRepositoryToken(OfficeEntity));
    userRepository = module.get(getRepositoryToken(UserEntity));
  });

  describe("findAll", () => {
    it("should return offices with pagination", async () => {
      officeRepository.findAndCount.mockResolvedValue([[mockOffice], 1]);

      const result = await service.findAll(defaultQuery);

      expect(result).toEqual({ items: [mockOffice], total: 1 });
      expect(officeRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ["staff"],
        order: { name: "ASC" },
        skip: 0,
        take: 20,
      });
    });

    it("should apply correct skip for page 2", async () => {
      officeRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ ...defaultQuery, page: 2 });

      expect(officeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 })
      );
    });

    it("should apply sorting parameters", async () => {
      officeRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        ...defaultQuery,
        sortBy: OfficeSortField.SPECIALIZATION,
        sortOrder: SortOrder.DESC,
      });

      expect(officeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { specialization: "DESC" } })
      );
    });

    it("should search by name and specialization when search provided", async () => {
      officeRepository.findAndCount.mockResolvedValue([[mockOffice], 1]);

      await service.findAll(defaultQuery, "cardio");

      expect(officeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [
            { name: expect.anything() },
            { specialization: expect.anything() },
          ],
        })
      );
    });

    it("should not filter when search not provided", async () => {
      officeRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(defaultQuery);

      expect(officeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });
  });

  describe("findById", () => {
    it("should return office when found", async () => {
      officeRepository.findOne.mockResolvedValue(mockOffice);

      const result = await service.findById(mockOffice.id);

      expect(result).toEqual(mockOffice);
      expect(officeRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockOffice.id },
        relations: ["staff"],
      });
    });

    it("should throw NotFoundException when office not found", async () => {
      officeRepository.findOne.mockResolvedValue(null);

      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw NotFoundException with OFFICE_NOT_FOUND error code", async () => {
      officeRepository.findOne.mockResolvedValue(null);

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
      officeRepository.findOne.mockRejectedValue(new Error("DB error"));

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
      staffIds: ["staff-1"],
      officeHoursTemplate: null,
    };

    it("should resolve staff IDs and create office with relation", async () => {
      userRepository.findBy.mockResolvedValue([mockStaff]);

      const saved = {
        ...mockOffice,
        name: createDto.name,
        specialization: createDto.specialization,
        address: createDto.address,
        staff: [mockStaff],
      } as OfficeEntity;
      officeRepository.create.mockReturnValue(saved);
      officeRepository.save.mockResolvedValue(saved);

      const result = await service.create(createDto);

      expect(result).toEqual(saved);
      expect(officeRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        specialization: createDto.specialization,
        address: createDto.address,
        officeHoursTemplate: createDto.officeHoursTemplate,
        staff: [mockStaff],
      });
    });

    it("should create office with empty staff when no IDs provided", async () => {
      const dtoNoStaff: CreateOfficeDto = {
        name: "Empty Office",
        specialization: "General",
        address: "789 Elm St",
        staffIds: [],
        officeHoursTemplate: null,
      };

      officeRepository.create.mockReturnValue(mockOffice);
      officeRepository.save.mockResolvedValue(mockOffice);

      await service.create(dtoNoStaff);

      expect(userRepository.findBy).not.toHaveBeenCalled();
      expect(officeRepository.create).toHaveBeenCalledWith({
        name: dtoNoStaff.name,
        specialization: dtoNoStaff.specialization,
        address: dtoNoStaff.address,
        officeHoursTemplate: dtoNoStaff.officeHoursTemplate,
        staff: [],
      });
    });
  });

  describe("replace", () => {
    const replaceDto: CreateOfficeDto = {
      name: "Replaced Office",
      specialization: "Cardiology",
      address: "789 New St",
      officeHoursTemplate: null,
      staffIds: ["staff-1"],
    };

    it("should replace all fields on the office entity", async () => {
      officeRepository.findOne.mockResolvedValue({ ...mockOffice });
      userRepository.findBy.mockResolvedValue([mockStaff]);
      const saved = {
        ...mockOffice,
        name: "Replaced Office",
        specialization: "Cardiology",
        address: "789 New St",
        officeHoursTemplate: null,
        staff: [mockStaff],
      };
      officeRepository.save.mockResolvedValue(saved);

      const result = await service.replace(mockOffice.id, replaceDto);

      expect(result).toEqual(saved);
      expect(officeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Replaced Office",
          specialization: "Cardiology",
          address: "789 New St",
          officeHoursTemplate: null,
        })
      );
    });

    it("should clear staff when staffIds is empty", async () => {
      officeRepository.findOne.mockResolvedValue({
        ...mockOffice,
        staff: [mockStaff],
      });
      officeRepository.save.mockResolvedValue({
        ...mockOffice,
        staff: [],
      });

      await service.replace(mockOffice.id, { ...replaceDto, staffIds: [] });

      expect(userRepository.findBy).not.toHaveBeenCalled();
      expect(officeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ staff: [] })
      );
    });

    it("should throw NotFoundException when office not found", async () => {
      officeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.replace("non-existent-id", replaceDto)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    const updateDto: UpdateOfficeDto = {
      name: "Updated Office",
      specialization: "Cardiology",
    };

    it("should update office fields and return updated entity", async () => {
      officeRepository.findOne.mockResolvedValue({ ...mockOffice });
      const saved = {
        ...mockOffice,
        name: "Updated Office",
        specialization: "Cardiology",
      };
      officeRepository.save.mockResolvedValue(saved);

      const result = await service.update(mockOffice.id, updateDto);

      expect(result).toEqual(saved);
      expect(officeRepository.save).toHaveBeenCalled();
    });

    it("should update staff when staffIds is provided", async () => {
      officeRepository.findOne.mockResolvedValue({ ...mockOffice });
      userRepository.findBy.mockResolvedValue([mockStaff]);
      const saved = { ...mockOffice, staff: [mockStaff] };
      officeRepository.save.mockResolvedValue(saved);

      const result = await service.update(mockOffice.id, {
        staffIds: ["staff-1"],
      });

      expect(result.staff).toEqual([mockStaff]);
      expect(userRepository.findBy).toHaveBeenCalledWith({
        id: expect.objectContaining({ _type: "in" }),
      });
    });

    it("should not update staff when staffIds is not provided", async () => {
      officeRepository.findOne.mockResolvedValue({ ...mockOffice });
      officeRepository.save.mockResolvedValue({
        ...mockOffice,
        name: "Updated Office",
      });

      await service.update(mockOffice.id, { name: "Updated Office" });

      expect(userRepository.findBy).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when office not found", async () => {
      officeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update("non-existent-id", updateDto)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should call repository.delete with the id", async () => {
      officeRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.remove(mockOffice.id);

      expect(officeRepository.delete).toHaveBeenCalledWith(mockOffice.id);
    });
  });
});
