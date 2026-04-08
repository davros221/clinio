import { Injectable } from "@nestjs/common";

@Injectable()
export class SettingsService {
  // ToDo: Fetch from office-specific settings later
  getOpeningHours(): { startingHour: number; endingHour: number } {
    return { startingHour: 6, endingHour: 20 };
  }
}
