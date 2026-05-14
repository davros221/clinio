import { ActionIcon, Alert, Skeleton, Title, Tooltip } from "@mantine/core";
import styles from "./chatPageSidebar.module.css";
import { MdOpenInNew } from "react-icons/md";
import { NavLink } from "react-router";
import { ROUTER_PATHS } from "@router";
import { NEW_CHAT_ID, useGetRoomsQuery } from "@modules/chat";
import { ChatPageUserCard } from "../ChatPageUserCard/ChatPageUserCard";
import { useUser } from "@hooks";
import { useT } from "@hooks";

export const ChatPageSidebar = () => {
  const t = useT();
  const { user } = useUser();
  const { data: rooms, isLoading } = useGetRoomsQuery();

  const otherParticipants = rooms
    ?.map((room) => ({
      roomId: room.id,
      participant: room.participants.find((p) => p.id !== user?.id),
      unreadCount: room.unreadCount,
    }))
    .filter((r) => r.participant !== undefined);

  return (
    <aside>
      <div className={styles.head}>
        <Title order={2}>{t("chat.sidebar.title")}</Title>
        <Tooltip label={t("chat.sidebar.newMessage")}>
          <ActionIcon
            variant={"default"}
            size={32}
            component={NavLink}
            to={ROUTER_PATHS.CHAT_DETAIL_ID(NEW_CHAT_ID)}
          >
            <MdOpenInNew size={18} />
          </ActionIcon>
        </Tooltip>
      </div>
      <div className={styles.list}>
        {isLoading && (
          <>
            <Skeleton height={48} radius="md" />
            <Skeleton height={48} radius="md" />
            <Skeleton height={48} radius="md" />
          </>
        )}
        {!isLoading && otherParticipants?.length === 0 && (
          <Alert variant={"default"} title={t("chat.sidebar.noChats.title")}>
            {t("chat.sidebar.noChats.message")}
          </Alert>
        )}
        {otherParticipants?.map(({ roomId, participant, unreadCount }) => (
          <ChatPageUserCard
            key={roomId}
            participant={participant!}
            unreadCount={unreadCount}
          />
        ))}
      </div>
    </aside>
  );
};
