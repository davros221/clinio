import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { AsyncAutocomplete } from "@components";
import { useGetPatientList } from "@api";
import { useT } from "@hooks";

type Props = {
  value: string | null;
  onChange: (id: string | null) => void;
  error?: string;
};

export function PatientSelectField({ value, onChange, error }: Props) {
  const t = useT();
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebouncedValue(searchInput, 200);

  const { data, isFetching } = useGetPatientList({ search, limit: 20 });

  const options =
    data?.items?.map((p) => ({
      value: p.id,
      label: `${p.firstName} ${p.lastName}`,
    })) ?? [];

  const displayValue =
    value != null
      ? options.find((o) => o.value === value)?.label ?? searchInput
      : searchInput;

  const handleSelect = (id: string) => {
    const selected = options.find((o) => o.value === id);
    setSearchInput(selected?.label ?? "");
    onChange(id);
  };

  const handleChange = (raw: string) => {
    setSearchInput(raw);
    if (raw === "") onChange(null);
  };

  return (
    <AsyncAutocomplete
      label={t("appointment.createModal.fields.patient")}
      placeholder={t("appointment.createModal.fields.patientPlaceholder")}
      data={options}
      value={displayValue}
      loading={isFetching}
      emptyMessage={t("common.error.noData")}
      onItemSelect={handleSelect}
      onChange={handleChange}
      keepSelectedValue
      inputProps={{ error }}
    />
  );
}
