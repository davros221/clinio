import { Anchor, Breadcrumbs as MantineBreadcrumbs, Text } from "@mantine/core";
import { Link } from "react-router";

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <MantineBreadcrumbs>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast || !item.to) {
          return (
            <Text key={index} fw={isLast ? 600 : 400}>
              {item.label}
            </Text>
          );
        }
        return (
          <Anchor key={index} component={Link} to={item.to}>
            {item.label}
          </Anchor>
        );
      })}
    </MantineBreadcrumbs>
  );
}
