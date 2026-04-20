import { Group, Skeleton, Text } from "@mantine/core";

type Props = {
  title: string;
  value?: string;
  loading?: boolean;
};

export const PatientDetailInfoRow = (props: Props) => {
  const { title, value, loading } = props;
  return (
    <Skeleton visible={loading}>
      <Group gap={4}>
        <Text fw={700}>{`${title}:`}</Text>
        <Text c="dimmed">{value}</Text>
      </Group>
      <Text></Text>
    </Skeleton>
  );
};
