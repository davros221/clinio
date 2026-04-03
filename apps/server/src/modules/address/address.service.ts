import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { internalError, badRequest } from "../../common/error-messages";
import { SuggestResponse } from "./dto/address.dto";

const SUGGEST_URL = "https://api.mapy.cz/v1/suggest";

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.apiKey = this.configService.getOrThrow<string>("ruian.api");
  }

  async suggest(query: string): Promise<SuggestResponse> {
    if (!query.trim()) {
      throw badRequest("Query must not be empty");
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<SuggestResponse>(SUGGEST_URL, {
          params: {
            apikey: this.apiKey,
            lang: "cs",
            limit: 5,
            type: "regional.address",
            query,
          },
        })
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Mapy.cz suggest failed: ${error?.response?.status} ${JSON.stringify(
          error?.response?.data
        )}`
      );
      throw internalError();
    }
  }
}
