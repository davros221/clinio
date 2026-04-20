import { useSearchParams } from "react-router";

export const usePagination = (defaults = { page: 1, pageSize: 20 }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawPage = Number(searchParams.get("page"));
  const page =
    Number.isInteger(rawPage) && rawPage > 0 ? rawPage : defaults.page;

  const rawSize = Number(searchParams.get("pageSize"));
  const pageSize =
    Number.isInteger(rawSize) && rawSize > 0 && rawSize <= 100
      ? rawSize
      : defaults.pageSize;

  const setPage = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(newPage));
      return prev;
    });
  };

  return { page, pageSize, setPage };
};
