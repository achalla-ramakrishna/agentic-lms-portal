import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "learner" | "facilitator";
    } & DefaultSession["user"];
  }

  interface User {
    role: "learner" | "facilitator";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "learner" | "facilitator";
  }
}
