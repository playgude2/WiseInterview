import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/interview(.*)",
  "/call(.*)",
  "/careers(.*)",
  "/api/register-call(.*)",
  "/api/get-call(.*)",
  "/api/generate-interview-questions(.*)",
  "/api/analyze-communication(.*)",
  "/api/apply-for-job(.*)",
  "/api/get-job-posts(.*)",
  "/api/ats-score-application(.*)",
  "/api/send-shortlist-email(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/interview(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }

  if (!auth().userId && isProtectedRoute(req)) {
    return auth().redirectToSignIn();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
