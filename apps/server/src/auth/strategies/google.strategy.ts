import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../auth.service";

export interface GoogleProfile {
  googleId: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService, private authService: AuthService) {
    super({
      clientID: configService.getOrThrow<string>("google.clientId"),
      clientSecret: configService.getOrThrow<string>("google.clientSecret"),
      callbackURL: configService.getOrThrow<string>("google.callbackUrl"),
      scope: ["email", "profile"],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<void> {
    try {
      const googleProfile = this.toGoogleProfile(profile);
      const user = await this.authService.validateGoogleUser(googleProfile);
      done(null, user);
    } catch (error) {
      done(error as Error, undefined);
    }
  }

  private toGoogleProfile(profile: Profile): GoogleProfile {
    const json = (profile._json ?? {}) as {
      email?: string;
      email_verified?: boolean;
      given_name?: string;
      family_name?: string;
    };
    const email = json.email ?? profile.emails?.[0]?.value;

    if (!email) {
      throw new Error("Google profile is missing email");
    }

    return {
      googleId: profile.id,
      email,
      emailVerified: json.email_verified === true,
      firstName: json.given_name ?? profile.name?.givenName ?? "",
      lastName: json.family_name ?? profile.name?.familyName ?? "",
    };
  }
}
