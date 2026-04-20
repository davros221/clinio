import { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "./Calendar";
import { CalendarSlot } from "../utils/types";

const sampleAppointments: CalendarSlot[] = [
  {
    id: "1",
    patientName: "Jan Novák",
    room: "Ordinace 1",

    start: "08:00",
    duration: 30,
    day: 1,
  },
  {
    id: "2",
    patientName: "Eva Svobodová",
    room: "Ordinace 2",

    start: "09:30",
    duration: 60,
    day: 1,
  },
  {
    id: "3",
    patientName: "Petr Dvořák",
    room: "Ordinace 1",

    start: "10:00",
    duration: 30,
    day: 2,
  },
  {
    id: "4",
    patientName: "Marie Černá",
    room: "Ordinace 3",

    start: "11:00",
    duration: 45,
    day: 3,
  },
  {
    id: "5",
    patientName: "Tomáš Procházka",
    room: "Ordinace 4",

    start: "14:00",
    duration: 30,
    day: 4,
  },
  {
    id: "6",
    patientName: "Lucie Veselá",
    room: "Ordinace 2",

    start: "08:30",
    duration: 60,
    day: 5,
  },
];

const meta = {
  component: Calendar,
  title: "Calendar",
  tags: ["autodocs"],
  argTypes: {
    onAppointmentMove: { table: { disable: true } },
    appointments: { table: { disable: true } },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    appointments: sampleAppointments,
  },
};

export const Empty: Story = {
  args: {
    appointments: [],
  },
};

export const BusyDay: Story = {
  args: {
    appointments: [
      ...sampleAppointments,
      {
        id: "7",
        patientName: "Karel Novotný",
        room: "Ordinace 1",

        start: "12:00",
        duration: 30,
        day: 1,
      },
      {
        id: "8",
        patientName: "Anna Kolářová",
        room: "Ordinace 3",

        start: "13:00",
        duration: 60,
        day: 1,
      },
      {
        id: "9",
        patientName: "Filip Horák",
        room: "Ordinace 2",

        start: "15:00",
        duration: 30,
        day: 1,
      },
    ],
  },
};
