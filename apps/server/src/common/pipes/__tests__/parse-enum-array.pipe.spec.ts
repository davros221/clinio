import { BadRequestException } from "@nestjs/common";
import { ParseEnumArrayPipe } from "../parse-enum-array.pipe";

enum Color {
  RED = "RED",
  BLUE = "BLUE",
  GREEN = "GREEN",
}

describe("ParseEnumArrayPipe", () => {
  let pipe: ParseEnumArrayPipe<typeof Color>;

  beforeEach(() => {
    pipe = new ParseEnumArrayPipe(Color);
  });

  it("should wrap a single valid string in an array", () => {
    expect(pipe.transform("RED")).toEqual(["RED"]);
  });

  it("should pass through a valid array unchanged", () => {
    expect(pipe.transform(["RED", "BLUE"])).toEqual(["RED", "BLUE"]);
  });

  it("should throw BadRequestException for an invalid value", () => {
    expect(() => pipe.transform("INVALID")).toThrow(BadRequestException);
  });

  it("should throw BadRequestException when value is missing and not optional", () => {
    expect(() => pipe.transform(undefined)).toThrow(BadRequestException);
  });

  it("should throw BadRequestException when value is empty string and not optional", () => {
    expect(() => pipe.transform("")).toThrow(BadRequestException);
  });

  describe("optional: true", () => {
    let optionalPipe: ParseEnumArrayPipe<typeof Color>;

    beforeEach(() => {
      optionalPipe = new ParseEnumArrayPipe(Color, true);
    });

    it("should return undefined when value is missing", () => {
      expect(optionalPipe.transform(undefined)).toBeUndefined();
    });

    it("should return undefined when value is empty string", () => {
      expect(optionalPipe.transform("")).toBeUndefined();
    });

    it("should still validate values when present", () => {
      expect(() => optionalPipe.transform("INVALID")).toThrow(
        BadRequestException
      );
    });

    it("should still transform valid values when present", () => {
      expect(optionalPipe.transform("GREEN")).toEqual(["GREEN"]);
    });
  });
});
