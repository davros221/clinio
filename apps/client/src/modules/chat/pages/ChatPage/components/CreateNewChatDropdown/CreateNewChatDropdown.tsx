import { AsyncAutocomplete } from "@components";
import styles from "./createNewChatDropdown.module.css";
import { useCreateNewChatDropdown } from "./useCreateNewChatDropdown";
import { useT } from "@hooks";

export const CreateNewChatDropdown = () => {
  const t = useT();
  const { data, value, isLoading, handleSelect, handleChange } =
    useCreateNewChatDropdown();
  return (
    <AsyncAutocomplete
      placeholder={t("chat.newChat.placeholder")}
      data={data}
      defaultOpened
      value={value}
      loading={isLoading}
      emptyMessage={t("chat.newChat.noUsers")}
      onItemSelect={handleSelect}
      onChange={handleChange}
      inputProps={{
        variant: "filled",
        classNames: {
          root: styles.root,
          input: styles.input,
        },
      }}
    />
  );
};
