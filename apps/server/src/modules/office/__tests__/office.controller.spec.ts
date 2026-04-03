import { Test, TestingModule } from "@nestjs/testing";
import { OfficeController } from "../office.controller";
import { OfficeService } from "../office.service";
import { OfficeEntity } from "../office.entity";
import { OfficeMapper } from "../mapper/OfficeMapper";
import { CreateOfficeDto } from "../dto/create-office.dto";
import { UpdateOfficeDto } from "../dto/update-office.dto";
import { UserRole, OfficeSortField, SortOrder } from "@clinio/shared";
import { UserEntity } from "../../user/user.entity";

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
  staff: [mockStaff],
};

const mockOfficeDto = OfficeMapper.toDto(mockOffice);

const mockOfficeService = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  replace: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe("OfficeController", () => {
  let controller: OfficeController;
  let service: jest.Mocked<Pick<OfficeService, "findAll" | "findById" | "create" | "replace" | "update" | "remove">>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficeController],
      providers: [
        {
          provide: OfficeService,
          useFactory: mockOfficeService,
        },
      ],
    }).compile();

    controller = module.get<OfficeController>(OfficeController);
    service = module.get(OfficeService);
  });

  describe("getAll", () => {
    const defaultQuery = {
      page: 1,
      limit: 20,
      sortBy: OfficeSortField.NAME,
      sortOrder: SortOrder.ASC,
    };

    it("should return paginated office DTOs", async () => {
      service.findAll.mockResolvedValue({ items: [mockOffice], total: 1 });

      const result = await controller.getAll();

      expect(result).toEqual({
        items: [mockOfficeDto],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(service.findAll).toHaveBeenCalledWith(defaultQuery, undefined);
    });

    it("should return empty items when no offices exist", async () => {
      service.findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await controller.getAll();

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it("should pass pagination and sorting params to service", async () => {
      service.findAll.mockResolvedValue({ items: [mockOffice], total: 1 });

      await controller.getAll(undefined, "2", "10", OfficeSortField.SPECIALIZATION, SortOrder.DESC);

      expect(service.findAll).toHaveBeenCalledWith(
        {
          page: 2,
          limit: 10,
          sortBy: OfficeSortField.SPECIALIZATION,
          sortOrder: SortOrder.DESC,
        },
        undefined
      );
    });

    it("should pass search to service", async () => {
      service.findAll.mockResolvedValue({ items: [mockOffice], total: 1 });

      await controller.getAll("cardio");

      expect(service.findAll).toHaveBeenCalledWith(defaultQuery, "cardio");
    });

    it("should calculate totalPages correctly", async () => {
      service.findAll.mockResolvedValue({ items: [mockOffice], total: 45 });

      const result = await controller.getAll(undefined, "1", "20");

      expect(result.totalPages).toBe(3);
    });
  });

  describe("getById", () => {
    it("should return mapped office DTO", async () => {
      service.findById.mockResolvedValue(mockOffice);

      const result = await controller.getById(mockOffice.id);

      expect(result).toEqual(mockOfficeDto);
      expect(service.findById).toHaveBeenCalledWith(mockOffice.id);
    });
  });

  describe("create", () => {
    const createDto: CreateOfficeDto = {
      name: "New Office",
      specialization: "Dermatology",
      address: "456 Oak Ave",
      officeHoursTemplate: null,
      staffIds: ["staff-1"],
    };

    it("should create office and return mapped DTO", async () => {
      const created: OfficeEntity = {
        ...mockOffice,
        name: createDto.name,
        specialization: createDto.specialization,
        address: createDto.address,
      };
      service.create.mockResolvedValue(created);

      const result = await controller.create(createDto);

      expect(result).toEqual(OfficeMapper.toDto(created));
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("replace", () => {
    const replaceDto: CreateOfficeDto = {
      name: "Replaced Office",
      specialization: "Cardiology",
      address: "789 New St",
      officeHoursTemplate: null,
      staffIds: [],
    };

    it("should replace office and return mapped DTO", async () => {
      const replaced: OfficeEntity = {
        ...mockOffice,
        name: replaceDto.name,
        specialization: replaceDto.specialization,
        address: replaceDto.address,
        officeHoursTemplate: null,
        staff: [],
      };
      service.replace.mockResolvedValue(replaced);

      const result = await controller.replace(mockOffice.id, replaceDto);

      expect(result).toEqual(OfficeMapper.toDto(replaced));
      expect(service.replace).toHaveBeenCalledWith(mockOffice.id, replaceDto);
    });
  });

  describe("update", () => {
    const updateDto: UpdateOfficeDto = {
      name: "Updated Office",
    };

    it("should update office and return mapped DTO", async () => {
      const updated: OfficeEntity = {
        ...mockOffice,
        name: "Updated Office",
      };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(mockOffice.id, updateDto);

      expect(result).toEqual(OfficeMapper.toDto(updated));
      expect(service.update).toHaveBeenCalledWith(mockOffice.id, updateDto);
    });
  });

  describe("delete", () => {
    it("should call service.remove with id", async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.delete(mockOffice.id);

      expect(service.remove).toHaveBeenCalledWith(mockOffice.id);
    });
  });
});
