import { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./DataTable";

type SampleRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

const sampleData: SampleRow[] = [
  {
    id: "1",
    firstName: "Jan",
    lastName: "Novák",
    email: "jan.novak@example.com",
  },
  {
    id: "2",
    firstName: "Eva",
    lastName: "Svobodová",
    email: "eva.svobodova@example.com",
  },
  {
    id: "3",
    firstName: "Petr",
    lastName: "Dvořák",
    email: "petr.dvorak@example.com",
  },
];

const sampleColumns = [
  { key: "firstName", header: "First Name" },
  { key: "lastName", header: "Last Name" },
  { key: "email", header: "Email" },
];

const meta = {
  component: DataTable,
  tags: ["autodocs"],
  argTypes: {
    data: { table: { disable: true } },
    columns: { table: { disable: true } },
    keyExtractor: { table: { disable: true } },
    actions: { table: { disable: true } },
    error: { table: { disable: true } },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    keyExtractor: (row) => (row as SampleRow).id,
  },
};

export const WithActions: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    keyExtractor: (row) => (row as SampleRow).id,
    actions: [
      {
        label: "Edit",
        onClick: () => {
          console.log("Edit clicked");
        },
        variant: "light",
      },
      {
        label: "Delete",
        onClick: () => {
          console.log("Delete clicked");
        },
        variant: "light",
        color: "red",
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns: sampleColumns,
    keyExtractor: (row) => (row as SampleRow).id,
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    data: [],
    columns: sampleColumns,
    keyExtractor: (row) => (row as SampleRow).id,
    isError: true,
    error: new globalThis.Error("Failed to fetch data"),
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: sampleColumns,
    keyExtractor: (row) => (row as SampleRow).id,
    emptyMessage: "No patients found",
  },
};
