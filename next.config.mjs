/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables next/navigation's forbidden()/unauthorized() — used to render
  // a real 403 for a logged-in learner hitting /admin/**, distinct from
  // the "no session" redirect-to-login case. See
  // docs/features/0003-auth-roles.md.
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
