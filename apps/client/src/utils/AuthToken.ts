export class AuthToken {
  private static readonly tokenName = "accessToken";

  /**
   * Returns an access token or null from local storage
   * @returns {string | null} - Access token or null if not found
   */
  public static get(): string | null {
    return localStorage.getItem(this.tokenName);
  }

  /**
   * Sets new token to local storage
   * @param token
   * @returns {void}
   */
  public static set(token: string): void {
    localStorage.setItem(this.tokenName, token);
  }

  /**
   * Checks if access token exists in local storage
   * @returns {boolean} - True if token exists, false otherwise
   */
  public static exists(): boolean {
    return !!localStorage.getItem(this.tokenName);
  }

  /**
   * Clears access token from local storage
   * @returns {void}
   */
  public static clear(): void {
    localStorage.removeItem(this.tokenName);
  }

  /**
   * Decodes JWT payload and returns the user ID (sub claim)
   * @returns {string | null}
   */
  public static getUserId(): string | null {
    const token = this.get();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }
}
