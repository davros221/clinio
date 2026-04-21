import { useParams } from "react-router";
import { useT } from "@hooks";
import { useGetPatientDetailQuery } from "@api";

export const usePatientDetailPage = () => {
  const params = useParams();
  const t = useT();
  const { id } = params;
  const { data, isFetching } = useGetPatientDetailQuery(id!);

  const toStr = (v: unknown): string | undefined => {
    if (v == null) return undefined;
    if (typeof v === "string") return v;
    return undefined;
  };

  const info = [
    { title: t("patient.form.firstName"), value: data?.firstName },
    { title: t("patient.form.lastName"), value: data?.lastName },
    { title: t("patient.form.birthdate"), value: toStr(data?.birthdate) },
    { title: t("patient.form.birthNumber"), value: toStr(data?.birthNumber) },
    { title: t("patient.form.phone"), value: toStr(data?.phone) },
    { title: t("patient.form.email"), value: data?.email },
  ];

  return {
    info,
    isFetching,
  };
};
