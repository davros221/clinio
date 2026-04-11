export const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName || !lastName) return "";
  return `${firstName[0].toUpperCase()} ${lastName[0].toUpperCase()}`;
};
