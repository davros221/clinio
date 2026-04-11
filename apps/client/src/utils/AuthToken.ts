export class AuthToken {
  private static readonly tokenName = "accessToken";

  public static get() {
    return localStorage.getItem(this.tokenName);
  }

  public static set(token: string) {
    localStorage.setItem(this.tokenName, token);
  }

  public static clear() {
    localStorage.removeItem(this.tokenName);
  }
}
