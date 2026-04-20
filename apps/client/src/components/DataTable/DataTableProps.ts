import { CSSProperties, ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  style?: CSSProperties;
};

export type DataTableAction<T> = {
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "filled" | "light" | "subtle" | "outline";
  color?: string;
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
};
