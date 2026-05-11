import { ReactNode } from "react";
import { TextInputProps } from "@mantine/core";

export type AutocompleteOption = { label: ReactNode; value: string };

export type AsyncAutocompleteProps = {
  data: AutocompleteOption[];
  /**
   * On textfield input change event
   */
  onChange?: (value: string) => void;
  /**
   * Loading state of the autocomplete
   */
  loading?: boolean;
  /**
   * Custom label of autocomplete
   */
  label?: string;
  /**
   * Custom placeholder of autocomplete
   */
  placeholder?: string;
  /**
   * Text field value
   */
  value?: string;
  /**
   * Custom message OR COMPONENT for empty option
   */
  emptyMessage?: ReactNode;
  /**
   * Handler for item selection
   */
  onItemSelect?: (id: string) => void;
  /**
   * Should input keep displayed selected option?
   */
  keepSelectedValue?: boolean;
  /**
   *
   */
  inputProps?: TextInputProps;
  /**
   * Should be opened by default?
   */
  defaultOpened?: boolean;
};
