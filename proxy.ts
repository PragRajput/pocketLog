import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  // Exclude auth pages, Next internals, and public PWA assets (these contain no
  // private data and must load without a session for install / icons / SW).
  matcher: [
    "/((?!login|signup|api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|icon.svg|icon-192.png|icon-512.png|apple-touch-icon.png).*)",
  ],
};
