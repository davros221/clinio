import { Avatar, Indicator, Text } from "@mantine/core";
import { NavLink, useParams } from "react-router";
import { ROUTER_PATHS } from "@router";
import type { RoomParticipant } from "@modules/chat";
import styles from "./chatPageUserCard.module.css";
import { clsx } from "clsx";

type Props = {
  participant: RoomParticipant;
  unreadCount: number;
};

export const ChatPageUserCard = ({ participant, unreadCount }: Props) => {
  const name = `${participant.firstName} ${participant.lastName}`;
  const { id } = useParams();

  const isSelected = id === participant.id;

  const className = clsx(styles.root, isSelected && styles.selected);
  return (
    <NavLink
      to={ROUTER_PATHS.CHAT_DETAIL_ID(participant.id)}
      className={className}
      style={{ textDecoration: "none" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Indicator
          disabled={unreadCount === 0}
          label={String(unreadCount)}
          size={16}
        >
          <Avatar color="initials" name={name} size="sm" />
        </Indicator>
        <Text size="sm" fw={500} c="dark">
          {name}
        </Text>
      </div>
    </NavLink>
  );
};
