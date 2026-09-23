import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // Set only by the company-branded login page (/login/:slug,
        // via LoginForm's companySlug prop) — a plain /login submits
        // none, so it's unrestricted as before. See docs/features/
        // 0020-branded-login-company-restriction.md.
        companySlug: { label: "Company", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );
        if (!valid) return null;

        // A company's branded login page is supposed to be *that*
        // company's own private entry point — a different company's
        // valid credentials authenticating there and correctly showing
        // *their own* data looked, from the outside, exactly like "the
        // Acme portal is showing CodeWalnut data." Reject with the same
        // generic failure a wrong password gets, not a distinguishing
        // message — telling someone their email belongs to a different
        // company would leak which companies an address is associated
        // with.
        if (credentials.companySlug && credentials.companySlug !== "undefined") {
          const company = await prisma.company.findUnique({
            where: { slug: credentials.companySlug },
            select: { id: true },
          });
          if (!company || company.id !== user.companyId) return null;
        }

        // A user's effective role set — see docs/features/
        // 0019-multi-role.md. Computed once here at login and carried
        // in the JWT; granting someone an extra role after they're
        // already logged in takes effect on their next login, the same
        // JWT-snapshot tradeoff lib/current-user.ts already documents
        // for name/email.
        const extraRoles = await prisma.userRole.findMany({
          where: { userId: user.id },
          select: { role: true },
        });
        const roles = Array.from(
          new Set([user.role, ...extraRoles.map((r) => r.role)]),
        );

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          roles,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "learner" | "facilitator";
        session.user.roles = token.roles;
      }
      return session;
    },
  },
};
