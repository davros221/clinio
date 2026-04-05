import { useState } from "react";
import type { CreatePatientDto } from "../types/patient";
import { createPatient } from "../api/patients";
import { notifySuccess, handleError } from "../utils/notification";

type FormErrors = Partial<Record<keyof CreatePatientDto, string>>;

export const useCreatePatient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
    if (data.password !== undefined && data.password.trim() === "")
      errors.password = "Heslo je povinné";

    return errors;
  };

  const submit = async (data: CreatePatientDto) => {
    const validationErrors = validate(data);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);
      setIsSuccess(false);
      setErrors({});
      await createPatient(data);
      notifySuccess("Hotovo!", "Pacient byl úspěšně založen.");
      setIsSuccess(true);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, isSuccess, errors, submit };
};
