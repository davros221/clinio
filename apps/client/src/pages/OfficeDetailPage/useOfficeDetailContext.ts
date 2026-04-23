import { useOutletContext } from "react-router";
import type { Office } from "@clinio/api";
import type { OfficeDetailFormReturn } from "./useOfficeDetailForm.ts";

export type OfficeDetailOutletContext = OfficeDetailFormReturn & {
  office: Office | null;
  editing: boolean;
  isNew: boolean;
};

export function useOfficeDetailContext() {
  return useOutletContext<OfficeDetailOutletContext>();
}
