interface User {
  [key: string]: unknown;
}

export const useUser = (): User | null => {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return null;
  }
  try {
    const parsed = JSON.parse(rawUser);
    if (parsed && typeof parsed === "object") {
      return parsed as User;
    }
  } catch {
    localStorage.removeItem("user");
  }
  return null;
};
