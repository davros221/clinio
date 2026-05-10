import styles from "../authLayout.module.css";
import { MdMessage } from "react-icons/md";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { getChatSocket, Message } from "@modules/chat";
import { matchPath, useNavigate } from "react-router";
import { ROUTER_PATHS } from "@router";
import { useGetMeQuery } from "@api";
import { useT } from "@hooks";

export const ChatNotifier = () => {
  const t = useT();
  const navigate = useNavigate();

  const { data: me } = useGetMeQuery();

  const goToChat = (otherUserId: string, notificationId: string) => {
    navigate(ROUTER_PATHS.CHAT_DETAIL_ID(otherUserId));
    notifications.hide(notificationId);
  };

  const handler = (message: Message) => {
    const match = matchPath(ROUTER_PATHS.CHAT_DETAIL, window.location.pathname);
    if (match?.params.id === message.senderId) return;
    if (me?.authData?.id === message.senderId) return;

    const id = notifications.show({
      title: t("chat.notification.newMessage"),
      message: message.text,
      icon: <MdMessage size={18} />,
      onClick: () => goToChat(message.senderId, id),
      withCloseButton: true,

      classNames: {
        root: styles.messageNotification,
      },
    });
  };

  useEffect(() => {
    const socket = getChatSocket();
    socket.on("message", handler);

    return () => {
      socket.off("message", handler);
    };
  }, []);

  return null;
};
