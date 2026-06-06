import { Combobox, Loader, TextInput } from "@mantine/core";
import { AsyncAutocompleteProps } from "./AsyncAutocompleteProps.ts";
import { useAsyncAutocomplete } from "./useAsyncAutocomplete.ts";

export const AsyncAutocomplete = (props: AsyncAutocompleteProps) => {
  const { data, loading, placeholder, label, value, emptyMessage, inputProps } =
    props;

  const { combobox, handleChange, onSubmit } = useAsyncAutocomplete(props);

  return (
    <Combobox store={combobox} shadow={"lg"} onOptionSubmit={onSubmit}>
      <Combobox.Target>
        <TextInput
          label={label}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          rightSectionPointerEvents={"none"}
          rightSection={loading && <Loader size={16} />}
          {...inputProps}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
          {data?.length === 0 && (
            <Combobox.Empty>{emptyMessage}</Combobox.Empty>
          )}
          {data.map((option) => (
            <Combobox.Option value={option.value} key={option.value}>
              {option.label}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
