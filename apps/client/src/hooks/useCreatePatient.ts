import { useState } from "react";
import type { CreatePatientDto } from "../types/patient";
import { createPatient } from "../api/patients";

type FormErrors = Partial<Record<keyof CreatePatientDto, string>>;

type Status = "idle" | "loading" | "success" | "error";

export const useCreatePatient = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (data: CreatePatientDto): FormErrors => {
    const errors: FormErrors = {};

    if (!data.firstName.trim()) errors.firstName = "Jméno je povinné";
    if (!data.lastName.trim()) errors.lastName = "Příjmení je povinné";
    if (!data.birthNumber.trim()) errors.birthNumber = "Rodné číslo je povinné";
    if (!data.birthdate) errors.birthdate = "Datum narození je povinné";
    if (!data.email.trim()) errors.email = "Email je povinný";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "Email není platný";
    if (!data.phone.trim()) errors.phone = "Telefon je povinný";
    if (!data.password?.trim()) errors.password = "Heslo je povinné";

    return errors;
  };

  const submit = async (data: CreatePatientDto) => {
    const validationErrors = validate(data);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setStatus("loading");
      setErrors({});
      await createPatient(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return { status, errors, submit };
};
