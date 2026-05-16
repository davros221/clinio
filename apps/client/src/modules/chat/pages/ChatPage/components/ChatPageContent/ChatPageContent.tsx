import styles from "./chatPageContent.module.css";
import { ActionIcon, Loader, Text } from "@mantine/core";
import { ImAttachment } from "react-icons/im";
import { BsEmojiHeartEyes, BsSendFill } from "react-icons/bs";
import { useChatContent } from "./useChatContent";
import { useParams } from "react-router";
import { NEW_CHAT_ID } from "@modules/chat";
import { ChatPageMessage } from "@modules/chat/pages/ChatPage/components";
import { useT } from "@hooks";

export const ChatPageContent = () => {
  const t = useT();
  const { id } = useParams();

  const showControls = id && id !== NEW_CHAT_ID;

  const {
    messages,
    isLoading,
    hasRoom,
    text,
    setText,
    handleSend,
    handleKeyDown,
  } = useChatContent();

  return (
    <div className={styles.root}>
      <div className={styles.scroller}>
        <div className={styles.messageList}>
          {isLoading && <Loader size="sm" mx="auto" />}
          {!isLoading && hasRoom && messages.length === 0 && (
            <Text c="dimmed" size="sm" ta="center">
              {t("chat.content.noMessages")}
            </Text>
          )}
          {messages.map((msg) => (
            <ChatPageMessage key={msg.id} {...msg} />
          ))}
        </div>
        <div className={styles.bottomOverlay} />
      </div>
      {showControls && (
        <div className={styles.messageControls}>
          <input
            type="text"
            className={styles.messageInput}
            placeholder={t("chat.content.messagePlaceholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!hasRoom}
          />
          <div className={styles.messageButtons}>
            <ActionIcon size={34} variant="white" color="gray">
              <ImAttachment size={18} />
            </ActionIcon>
            <ActionIcon size={34} variant="white" color="gray">
              <BsEmojiHeartEyes size={18} />
            </ActionIcon>
            <ActionIcon
              size={34}
              onClick={handleSend}
              disabled={!hasRoom || !text.trim()}
            >
              <BsSendFill size={18} />
            </ActionIcon>
          </div>
        </div>
      )}
    </div>
  );
};
