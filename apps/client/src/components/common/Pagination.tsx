import { Center, Pagination as MantinePagination } from "@mantine/core";

type Props = {
  total: number;
  current: number;
  onChange: (page: number) => void;
  disabled?: boolean;
};

export function Pagination({ total, current, onChange, disabled }: Props) {
  if (total <= 1) return null;

  return (
    <Center py="md">
      <MantinePagination
        total={total}
        value={current}
        onChange={onChange}
        disabled={disabled}
      />
    </Center>
  );
}
