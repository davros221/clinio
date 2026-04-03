import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { of, throwError } from "rxjs";
import { AxiosResponse } from "axios";
import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { AddressService } from "../address.service";

describe("AddressService", () => {
  let service: AddressService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: HttpService,
          useFactory: () => ({
            get: jest.fn(),
          }),
        },
        {
          provide: ConfigService,
          useFactory: () => ({
            getOrThrow: jest.fn().mockReturnValue("test-api-key"),
          }),
        },
      ],
    }).compile();

    service = module.get(AddressService);
    httpService = module.get(HttpService);
  });

  it("should return suggest results", async () => {
    const expected = {
      items: [{ name: "Zhořec 1", label: "Zhořec 1", location: "Zhořec" }],
    };
    (httpService.get as jest.Mock).mockReturnValue(
      of({ data: expected } as AxiosResponse)
    );

    const result = await service.suggest("Zhoř");

    expect(result).toEqual(expected);
    expect(httpService.get).toHaveBeenCalledWith(
      "https://api.mapy.cz/v1/suggest",
      {
        params: {
          apikey: "test-api-key",
          lang: "cs",
          limit: 5,
          type: "regional.address",
          query: "Zhoř",
        },
      }
    );
  });

  it("should throw bad request for empty query", async () => {
    await expect(service.suggest("  ")).rejects.toThrow(BadRequestException);
  });

  it("should throw internal error on HTTP failure", async () => {
    (httpService.get as jest.Mock).mockReturnValue(
      throwError(() => new Error("network error"))
    );

    await expect(service.suggest("Praha")).rejects.toThrow(
      InternalServerErrorException
    );
  });
});
