import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      accessToken: string;
      rol: string;
      avatar: string;
    };
  }
}
