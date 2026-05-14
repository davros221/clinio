import { Message } from "@modules/chat";
import styles from "./chatPageMessage.module.css";
import { useUser } from "@hooks";
import { clsx } from "clsx";

export const ChatPageMessage = (props: Message) => {
  const { text } = props;
  const { user } = useUser();

  const isMyMessage = user?.id === props.senderId;

  const className = clsx(styles.message, isMyMessage && styles.mine);
  return <div className={className}>{text}</div>;
};
