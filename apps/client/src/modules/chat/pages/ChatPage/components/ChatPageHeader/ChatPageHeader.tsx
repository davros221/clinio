import { CSSProperties } from "react";
import { alpha, Title } from "@mantine/core";
import styles from "./chatPageHeader.module.css";
import { useParams } from "react-router";
import { NEW_CHAT_ID } from "@modules/chat";
import { CreateNewChatDropdown } from "../";
import { useGetUserDetailQuery } from "@api";
import { composeUserName } from "@utils";

export const ChatPageHeader = () => {
  const inlineStyle: CSSProperties = {
    "--bg-color": alpha("var(--mantine-color-gray-1)", 0.6),
  } as CSSProperties;

  const params = useParams();
  const isNewChat = params?.id === NEW_CHAT_ID;

  const shouldFetchUser = !!params?.id && !isNewChat;
  const { data } = useGetUserDetailQuery(params.id!, shouldFetchUser);

  if (isNewChat)
    return (
      <div className={styles.root} style={inlineStyle}>
        <CreateNewChatDropdown />
      </div>
    );

  return (
    <div className={styles.root} style={inlineStyle}>
      <Title order={4}>{data && composeUserName(data)}</Title>
    </div>
  );
};
