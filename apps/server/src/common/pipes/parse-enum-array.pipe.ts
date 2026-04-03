import { Injectable, PipeTransform } from "@nestjs/common";
import { badRequest } from "../error-messages";

@Injectable()
export class ParseEnumArrayPipe<T extends Record<string, string>>
  implements PipeTransform<string | string[], T[keyof T][]>
{
  private readonly validValues: string[];

  constructor(enumType: T) {
    this.validValues = Object.values(enumType);
  }

  transform(value: string | string[] | undefined): T[keyof T][] {
    if (value === undefined || value === "") {
      throw badRequest(
        `Expected one or more values from: ${this.validValues.join(", ")}`
      );
    }

    const values = Array.isArray(value) ? value : [value];

    const invalid = values.filter((v) => !this.validValues.includes(v));
    if (invalid.length > 0) {
      throw badRequest(
        `Invalid value(s): ${invalid.join(
          ", "
        )}. Expected: ${this.validValues.join(", ")}`
      );
    }

    return values as T[keyof T][];
  }
}
