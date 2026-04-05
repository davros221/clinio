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

    if (!data.firstName.trim()) errors.firstName = "First name is required";
    if (!data.lastName.trim()) errors.lastName = "Last name is required";
    if (!data.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "Email is not valid";
    if (!data.birthNumber?.trim())
      errors.birthNumber = "Birth number is required";
    if (!data.birthdate) errors.birthdate = "Date of birth is required";
    if (!data.phone?.trim()) errors.phone = "Phone is required";

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
      notifySuccess("Done!", "Patient was successfully created.");
      setIsSuccess(true);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, isSuccess, errors, submit };
};
