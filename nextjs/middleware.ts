import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/api/upload",
  "/api/user",
  "/api/webhooks/stripe",
  "/api/webhooks/clerk",
])
const isSecureRoute = createRouteMatcher([
  "/api/asset-processing-job",
  "/api/asset",
  "/api/crawl",
  "/api/crawl/requests",
  "/api/crawl/results",
  "/api/crawl/results/[id]",
  "/api/crawl/requests/[id]",
  "/api/detect-pagination",
  "/api/scrape/results",
  "/api/scrape/requests",
  "/api/scrape/requests/[id]",
  "/api/scrape/results/[id]",
  "/api/scrape/"
])

const SERVER_API_KEY = process.env.SERVER_API_KEY;
if (!SERVER_API_KEY) {
  throw new Error("SERVER_API_KEY is not set");
}

export default clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname === "/api/webhooks/stripe" || request.nextUrl.pathname === "/api/webhooks/clerk") {
    // Skip authentication for Stripe webhooks
    return NextResponse.next();
  }
  if (request.url.startsWith("http://api.paul-miracle.info:5000")) {
    return NextResponse.next();
  }

  // Await the auth() to get the resolved value
  const user = await auth();
  if (isSecureRoute(request)) {
    // ✅ Allow access if the user is authenticated through Clerk
    if (user?.userId) {
      return NextResponse.next();
    }
    // ✅ Otherwise, fall back to checking service worker authorization
    return checkServiceWorkerAuth(request);
  }
  // Check if the user is authenticated for public routes
  if (!user?.userId && !isPublicRoute(request)) {
    (await auth()).redirectToSignIn()
  }

  return NextResponse.next();
});

function checkServiceWorkerAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  if (token !== SERVER_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();

}


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/((?!api|_next|.*\\..*).*)",
  ],
};

