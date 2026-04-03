import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AuthService } from "../auth.service";
import { UserService } from "../../modules/user/user.service";
import { UserEntity } from "../../modules/user/user.entity";
import { UserRole, ErrorCode } from "@clinio/shared";

const mockUser: UserEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "john@example.com",
  password: "hashed-password",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.DOCTOR,
};

const mockUserService = () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe("AuthService", () => {
  let service: AuthService;
  let userService: jest.Mocked<Pick<UserService, "findByEmail" | "findById">>;
  let jwtService: jest.Mocked<Pick<JwtService, "sign">>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: UserService, useFactory: mockUserService }, { provide: JwtService, useFactory: mockJwtService }],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  describe("login", () => {
    const loginDto = { email: "john@example.com", password: "StrongP@ss1" };

    it("should return access token and auth data on valid credentials", async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(true));
      jwtService.sign.mockReturnValue("jwt-token");

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: "jwt-token",
        authData: {
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
      });
    });

    it("should sign JWT with correct payload", async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(true));
      jwtService.sign.mockReturnValue("jwt-token");

      await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it("should throw UnauthorizedException when user not found", async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw with INVALID_CREDENTIALS error code when user not found", async () => {
      userService.findByEmail.mockResolvedValue(null);

      try {
        await service.login(loginDto);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).getResponse()).toMatchObject({
          errorCode: ErrorCode.INVALID_CREDENTIALS,
        });
      }
    });

    it("should throw UnauthorizedException when password is wrong", async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw with INVALID_CREDENTIALS error code when password is wrong", async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(false));

      try {
        await service.login(loginDto);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).getResponse()).toMatchObject({
          errorCode: ErrorCode.INVALID_CREDENTIALS,
        });
      }
    });

    it("should throw UnauthorizedException when user has no password (null)", async () => {
      const passwordlessUser: UserEntity = { ...mockUser, password: null };
      userService.findByEmail.mockResolvedValue(passwordlessUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw INVALID_CREDENTIALS when user has no password", async () => {
      const passwordlessUser: UserEntity = { ...mockUser, password: null };
      userService.findByEmail.mockResolvedValue(passwordlessUser);

      try {
        await service.login(loginDto);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).getResponse()).toMatchObject({
          errorCode: ErrorCode.INVALID_CREDENTIALS,
        });
      }
    });

    it("should not leak whether email or password was wrong", async () => {
      userService.findByEmail.mockResolvedValue(null);
      let errorNoUser: UnauthorizedException | undefined;
      try {
        await service.login(loginDto);
      } catch (e) {
        errorNoUser = e as UnauthorizedException;
      }

      userService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(false));
      let errorBadPass: UnauthorizedException | undefined;
      try {
        await service.login(loginDto);
      } catch (e) {
        errorBadPass = e as UnauthorizedException;
      }

      expect(errorNoUser!.getResponse()).toEqual(errorBadPass!.getResponse());
    });
  });

  describe("me", () => {
    it("should return auth data for valid user", async () => {
      userService.findById.mockResolvedValue(mockUser);

      const result = await service.me(mockUser.id);

      expect(result).toEqual({
        auth: true,
        authData: {
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
      });
    });

    it("should call userService.findById with correct id", async () => {
      userService.findById.mockResolvedValue(mockUser);

      await service.me(mockUser.id);

      expect(userService.findById).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
