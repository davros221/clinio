import { useParams } from "react-router";
import { useT } from "@hooks";
import { useGetPatientDetailQuery } from "@api";

export const usePatientDetailPage = () => {
  const params = useParams();
  const t = useT();
  const { id } = params;
  const { data, isFetching } = useGetPatientDetailQuery(id!);

  const info = [
    { title: t("patient.form.firstName"), value: data?.firstName },
    { title: t("patient.form.lastName"), value: data?.lastName },
    { title: t("patient.form.birthdate"), value: data?.birthdate ?? undefined },
    {
      title: t("patient.form.birthNumber"),
      value: data?.birthNumber ?? undefined,
    },
    { title: t("patient.form.phone"), value: data?.phone ?? undefined },
    { title: t("patient.form.email"), value: data?.email },
  ];

  return {
    info,
    isFetching,
  };
};
