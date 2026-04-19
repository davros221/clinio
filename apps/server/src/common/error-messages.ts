import {
  BadRequestException,
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

export function badRequest(message: string): BadRequestException {
  return new BadRequestException({
    errorCode: ErrorCode.BAD_REQUEST,
    message,
  });
}

export function forbidden(): ForbiddenException {
  return new ForbiddenException({
    errorCode: ErrorCode.FORBIDDEN,
    message: "Forbidden",
  });
}

export function appointmentNotFound(): NotFoundException {
  return new NotFoundException({
    errorCode: ErrorCode.APPOINTMENT_NOT_FOUND,
    message: "Appointment not found",
  });
}

export function accountNotActive(): ForbiddenException {
  return new ForbiddenException({
    errorCode: ErrorCode.ACCOUNT_NOT_ACTIVE,
    message: "Account not active",
  });
}

export function invalidResetToken(): BadRequestException {
  return new BadRequestException({
    errorCode: ErrorCode.INVALID_RESET_TOKEN,
    message: "Invalid reset token",
  });
}

export function resetTokenExpired(): BadRequestException {
  return new BadRequestException({
    errorCode: ErrorCode.RESET_TOKEN_EXPIRED,
    message: "Reset token has expired",
  });
}

export function appointmentSlotTaken(): ConflictException {
  return new ConflictException({
    errorCode: ErrorCode.APPOINTMENT_SLOT_TAKEN,
    message: "Appointment slot is already taken",
  });
}

export function appointmentOutsideHours(): BadRequestException {
  return new BadRequestException({
    errorCode: ErrorCode.APPOINTMENT_OUTSIDE_HOURS,
    message: "Appointment hour is outside of opening hours",
  });
}

export function googleEmailNotVerified(): UnauthorizedException {
  return new UnauthorizedException({
    errorCode: ErrorCode.GOOGLE_EMAIL_NOT_VERIFIED,
    message: "Google email is not verified",
  });
}

export function patientProfileIncomplete(): ForbiddenException {
  return new ForbiddenException({
    errorCode: ErrorCode.PATIENT_PROFILE_INCOMPLETE,
    message: "Patient profile is incomplete",
  });
}
