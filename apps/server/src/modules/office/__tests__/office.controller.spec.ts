import { Test, TestingModule } from "@nestjs/testing";
import { OfficeController } from "../office.controller";
import { OfficeService } from "../office.service";
import { OfficeEntity } from "../office.entity";
import { OfficeMapper } from "../mapper/OfficeMapper";
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

const mockOfficeDto = OfficeMapper.toDto(mockOffice);

const mockOfficeService = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
});

describe("OfficeController", () => {
  let controller: OfficeController;
  let service: jest.Mocked<
    Pick<OfficeService, "findAll" | "findById" | "create" | "remove">
  >;

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
    it("should return mapped office DTOs", async () => {
      service.findAll.mockResolvedValue([mockOffice]);

      const result = await controller.getAll();

      expect(result).toEqual([mockOfficeDto]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no offices exist", async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.getAll();

      expect(result).toEqual([]);
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
    };

    it("should create office and return mapped DTO", async () => {
      const created: OfficeEntity = {
        ...mockOffice,
        ...createDto,
      };
      service.create.mockResolvedValue(created);

      const result = await controller.create(createDto);

      expect(result).toEqual(OfficeMapper.toDto(created));
      expect(service.create).toHaveBeenCalledWith(createDto);
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
