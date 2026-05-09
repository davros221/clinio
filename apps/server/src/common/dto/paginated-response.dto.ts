import { ApiProperty } from "@nestjs/swagger";
import { Type } from "@nestjs/common";

export function paginatedResponse<T>(
  items: T[],
  total: number,
  query: { page: number; limit: number }
) {
  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  };
}

export function PaginatedResponseDto<T>(itemType: Type<T>) {
  class PaginatedResponseClass {
    @ApiProperty({ type: [itemType] })
    items!: T[];

    @ApiProperty()
    total!: number;

    @ApiProperty()
    page!: number;

    @ApiProperty()
    limit!: number;

    @ApiProperty()
    totalPages!: number;
  }

  Object.defineProperty(PaginatedResponseClass, "name", {
    value: `Paginated${itemType.name}Response`,
  });

  return PaginatedResponseClass;
}
