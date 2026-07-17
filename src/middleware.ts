export { default } from "next-auth/middleware";

export const config = {
  // Protect all /studio paths except /studio/login
  matcher: ["/studio/((?!login).*)", "/studio"],
};
