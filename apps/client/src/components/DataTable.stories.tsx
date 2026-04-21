import { Meta, StoryObj } from "@storybook/react";
import { ErrorCode } from "@clinio/shared";
import { DataTable } from "./DataTable";
import { DataTableColumn } from "./DataTable/DataTableProps";

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

const sampleColumns: DataTableColumn<SampleRow>[] = [
  { key: "firstName", header: "First Name", render: (row) => row.firstName },
  { key: "lastName", header: "Last Name", render: (row) => row.lastName },
  { key: "email", header: "Email", render: (row) => row.email },
];

const keyExtractor = (row: SampleRow) => row.id;

const meta = {
  component: DataTable,
  tags: ["autodocs"],
  argTypes: {
    data: { table: { disable: true } },
    columns: { table: { disable: true } },
    keyExtractor: { table: { disable: true } },
    actions: { table: { disable: true } },
    error: { table: { disable: true } },
    pagination: { table: { disable: true } },
  },
} satisfies Meta<typeof DataTable<SampleRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    keyExtractor,
  },
};

export const WithActions: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    keyExtractor,
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
    keyExtractor,
    isLoading: true,
  },
};

export const Fetching: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    keyExtractor,
    isFetching: true,
  },
};

export const Error: Story = {
  args: {
    data: [],
    columns: sampleColumns,
    keyExtractor,
    isError: true,
    error: {
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "Failed to fetch data",
    },
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: sampleColumns,
    keyExtractor,
    emptyMessage: "No patients found",
  },
};

export const WithPagination: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    keyExtractor,
    pagination: {
      total: 5,
      current: 1,
      onChange: (page) => {
        console.log("Page changed:", page);
      },
    },
  },
};
