import { Injectable } from "@nestjs/common";
import { faker } from "@faker-js/faker";
import { addDays, startOfWeek } from "date-fns";
import {
  AppointmentStatus,
  AppointmentType,
  CalendarDay,
  CalendarHourState,
} from "./dto/calendar.dto";

@Injectable()
export class CalendarService {
  async getWeek(date: Date): Promise<CalendarDay[]> {
    const monday = startOfWeek(date, { weekStartsOn: 1 });
    const days: CalendarDay[] = Array.from({ length: 7 }, (_, i) => ({
      date: addDays(monday, i),
      day: i,
      hours: Array.from({ length: 10 }, (_, j) => {
        const availability = faker.helpers.weightedArrayElement([
          { value: CalendarHourState.AVAILABLE, weight: 3 },
          { value: CalendarHourState.NOT_AVAILABLE, weight: 4 },
          { value: CalendarHourState.BOOKED, weight: 2 },
        ]);
        return {
          hour: j + 8,
          state: availability,
          appointment:
            availability !== CalendarHourState.BOOKED
              ? undefined
              : {
                  id: faker.string.uuid(),
                  isOwned: faker.datatype.boolean(),
                  type: faker.helpers.enumValue(AppointmentType),
                  status: faker.helpers.weightedArrayElement([
                    { value: AppointmentStatus.CONFIRMED, weight: 5 },
                    { value: AppointmentStatus.PENDING, weight: 3 },
                    { value: AppointmentStatus.CANCELLED, weight: 1 },
                    { value: AppointmentStatus.NO_SHOW, weight: 1 },
                  ]),
                  note: faker.helpers.maybe(() => faker.lorem.sentence(), {
                    probability: 0.3,
                  }),
                  doctor: {
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                    id: faker.string.uuid(),
                    specialization: faker.helpers.arrayElement([
                      "generalPractitioner",
                      "dermatologist",
                      "cardiologist",
                      "neurologist",
                      "orthopedist",
                      "entSpecialist",
                    ]),
                  },
                  patient: {
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                    id: faker.string.uuid(),
                    phone: faker.phone.number({ style: "international" }),
                    insuranceCode: faker.helpers.arrayElement([
                      "111",
                      "201",
                      "205",
                      "207",
                      "211",
                      "213",
                    ]),
                  },
                },
        };
      }),
    }));

    return days;
  }
}
