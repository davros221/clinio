export class StringUtils {
  public static getInitials(firstName?: string, lastName?: string): string {
    if (!firstName || !lastName) return "";
    return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
  }
}
