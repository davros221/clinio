import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

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
    <div>
      <label
        style={{ fontSize: "var(--mantine-font-size-sm)", fontWeight: 500 }}
      >
        {label}
      </label>
      <PhoneInput defaultCountry="cz" value={value} onChange={onChange} />
      {error && (
        <p
          style={{
            color: "var(--mantine-color-error)",
            fontSize: "var(--mantine-font-size-xs)",
            marginTop: 4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};
