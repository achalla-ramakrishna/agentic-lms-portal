import { withAuth } from "next-auth/middleware";

// Any authenticated session may pass here — the facilitator-only check for
// /admin/** happens in app/admin/layout.tsx (a "no session" redirect and a
// "logged in but wrong role" 403 are different situations for the user;
// see docs/features/0003-auth-roles.md).
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/competencies/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/submissions/:path*",
  ],
};
