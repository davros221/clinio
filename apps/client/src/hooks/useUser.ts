export const useUser = () => {
  const rawUser = localStorage.getItem("user");

  return rawUser ? JSON.parse(rawUser) : null;
};
