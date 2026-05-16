import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { useGetUsersQuery, roomKeys, useGetMeQuery } from "@api";
import { UserRole } from "@clinio/shared";
import { useNavigate } from "react-router";
import { composeUserName } from "@utils";
import { emitJoin } from "@modules/chat";
import { useQueryClient } from "@tanstack/react-query";

export const useCreateNewChatDropdown = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebouncedValue(searchInput, 200);
  const { data: me } = useGetMeQuery();

  const getRoles = (): UserRole[] => {
    const role = me?.authData?.role;

    if (role === UserRole.DOCTOR || role === UserRole.NURSE)
      return [UserRole.CLIENT];
    if (role === UserRole.CLIENT) return [UserRole.DOCTOR, UserRole.NURSE];
    return [];
  };

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const roles = getRoles();
  const { data, isFetching } = useGetUsersQuery({
    roles,
    search,
    limit: 10,
  });

  const selectData = data?.items?.map((user) => ({
    label: composeUserName(user),
    value: user.id,
  }));

  const handleSelect = (id: string) => {
    setSearchInput("");
    navigate(`/chat/${id}`);
    emitJoin(id)
      .then(() => queryClient.invalidateQueries({ queryKey: roomKeys.lists() }))
      .catch(console.error);
  };

  return {
    data: selectData || [],
    value: searchInput,
    isLoading: isFetching,
    handleSelect,
    handleChange: setSearchInput,
  };
};
