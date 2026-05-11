import { useCombobox } from "@mantine/core";
import { ChangeEvent } from "react";
import { AsyncAutocompleteProps } from "@components";

export const useAsyncAutocomplete = (props: AsyncAutocompleteProps) => {
  const { defaultOpened, onChange, onItemSelect } = props;

  const combobox = useCombobox({
    onDropdownOpen: () => combobox.updateSelectedOptionIndex(),
    onDropdownClose: () => combobox.resetSelectedOption(),
    defaultOpened,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const onSubmit = (val: string) => {
    combobox.closeDropdown();
    onItemSelect?.(val);
  };

  return {
    combobox,
    handleChange,
    onSubmit,
  };
};
