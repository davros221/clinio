import { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "./Calendar";
import { CalendarDay } from "@clinio/api";

const makeDay = (
  day: number,
  bookedHours: { hour: number; patient: string }[] = []
): CalendarDay => ({
  date: `2025-01-${String(day + 6).padStart(2, "0")}`,
  day,
  hours: Array.from({ length: 10 }, (_, i) => {
    const hour = 8 + i;
    const booked = bookedHours.find((b) => b.hour === hour);
    return {
      hour,
      state: booked ? "BOOKED" : "AVAILABLE",
      appointment: booked
        ? {
            id: `${day}-${hour}`,
            patient: {
              id: `p-${day}-${hour}`,
              firstName: booked.patient.split(" ")[0],
              lastName: booked.patient.split(" ")[1] ?? "",
              email: "",
              phone: "",
              birthNumber: "",
            },
          }
        : undefined,
    };
  }),
});

const closedDay = (day: number, date: string): CalendarDay => ({
  date,
  day,
  hours: Array.from({ length: 10 }, (_, i) => ({
    hour: 8 + i,
    state: "CLOSED",
  })),
});

const sampleDays: CalendarDay[] = [
  makeDay(0, [
    { hour: 8, patient: "Jan Novák" },
    { hour: 10, patient: "Eva Svobodová" },
  ]),
  makeDay(1, [{ hour: 9, patient: "Petr Dvořák" }]),
  makeDay(2, [{ hour: 11, patient: "Marie Černá" }]),
  makeDay(3, [{ hour: 14, patient: "Tomáš Procházka" }]),
  makeDay(4, [{ hour: 8, patient: "Lucie Veselá" }]),
  closedDay(5, "2025-01-11"),
  closedDay(6, "2025-01-12"),
];

const meta = {
  component: Calendar,
  title: "Calendar",
  tags: ["autodocs"],
  argTypes: {
    onAppointmentMove: { table: { disable: true } },
    calendarDays: { table: { disable: true } },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    calendarDays: sampleDays,
    officeName: "Ordinace 1",
  },
};

export const Empty: Story = {
  args: {
    calendarDays: sampleDays.map((d) => ({
      ...d,
      hours: d.hours.map((h) => ({
        ...h,
        state: h.state === "BOOKED" ? "AVAILABLE" : h.state,
        appointment: undefined,
      })),
    })),
    officeName: "Ordinace 1",
  },
};

export const BusyDay: Story = {
  args: {
    calendarDays: [
      makeDay(0, [
        { hour: 8, patient: "Jan Novák" },
        { hour: 9, patient: "Eva Svobodová" },
        { hour: 10, patient: "Petr Dvořák" },
        { hour: 11, patient: "Marie Černá" },
        { hour: 13, patient: "Tomáš Procházka" },
        { hour: 14, patient: "Lucie Veselá" },
        { hour: 15, patient: "Karel Novotný" },
      ]),
      ...sampleDays.slice(1),
    ],
    officeName: "Ordinace 1",
  },
};
