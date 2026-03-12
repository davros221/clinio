import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ErrorCode } from "@clinio/shared";

export function internalError(): InternalServerErrorException {
  return new InternalServerErrorException({
    errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
  });
}

export function notFound(entity: string, code?: ErrorCode): NotFoundException {
  return new NotFoundException({
    errorCode: code ?? ErrorCode.NOT_FOUND,
    message: `${entity} not found`,
  });
}

export function invalidCredentials(): UnauthorizedException {
  return new UnauthorizedException({
    errorCode: ErrorCode.INVALID_CREDENTIALS,
    message: "Invalid email or password",
  });
}

export function unauthorized(): UnauthorizedException {
  return new UnauthorizedException({
    errorCode: ErrorCode.UNAUTHORIZED,
    message: "Unauthorized",
  });
}

export function emailAlreadyExists(): ConflictException {
  return new ConflictException({
    errorCode: ErrorCode.EMAIL_ALREADY_EXISTS,
    message: "Email already exists",
  });
}

export function forbidden(): ForbiddenException {
  return new ForbiddenException({
    errorCode: ErrorCode.FORBIDDEN,
    message: "Forbidden",
  });
}
