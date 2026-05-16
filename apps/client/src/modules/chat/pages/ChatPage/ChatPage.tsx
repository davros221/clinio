import styles from "./chatPage.module.css";
import { ChatPageSidebar, ChatPageContent, ChatPageHeader } from "./components";

export const ChatPage = () => {
  return (
    <div className={styles.root}>
      <ChatPageSidebar />
      <div className={styles.conversationPanel}>
        <ChatPageHeader />
        <ChatPageContent />
      </div>
    </div>
  );
};
