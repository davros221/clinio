import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiInternalServerErrorResponse, ApiBadRequestResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AddressService } from "./address.service";
import { SuggestResponse } from "./dto/address.dto";

@Controller("addresses")
@ApiTags("Address")
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get("suggest")
  @ApiOperation({ operationId: "suggestAddress" })
  @ApiOkResponse({ type: SuggestResponse })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiQuery({ name: "query", required: true })
  async suggest(@Query("query") query: string): Promise<SuggestResponse> {
    return this.addressService.suggest(query);
  }
}
