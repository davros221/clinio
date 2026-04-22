import { Input } from "@mantine/core";
import { PhoneInput } from "react-international-phone";

type PhoneInputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
};

export const PhoneInputField = ({
  label,
  value,
  onChange,
  error,
}: PhoneInputFieldProps) => {
  return (
    <Input.Wrapper label={label} error={error}>
      <PhoneInput defaultCountry="cz" value={value} onChange={onChange} />
    </Input.Wrapper>
  );
};
