import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from "axios";

export const config = {
  matcher: [
    "/profile/:path*",
    "/chat/:path*",
    "/login/:path*",
    "/sign-up/:path*",
    "/",
  ],
};

export async function middleware(request: NextRequest) {
  const AccessToken = request.cookies.get("accessToken");
  const url = request.nextUrl;

  if (AccessToken) {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/verify_access_token`,
        {
          withCredentials: true,
          headers: {
            token: AccessToken.value,
          },
        },
      );
      const username = res.data.data.username;

      if (res.status === 200) {
        // Redirect if accessing sign-up, login, verify, or root path
        if (
          url.pathname.startsWith("/sign-up") ||
          url.pathname.startsWith("/login") ||
          url.pathname.startsWith("/verify") ||
          url.pathname === "/"
        ) {
          return NextResponse.redirect(
            new URL(`/chat/${username}`, request.url),
          );
        }
      }
    } catch (err) {
      // if server down redirect to /server-down page
      return NextResponse.redirect(new URL("/server-down", request.url));
    }
  }

  // Redirect to login if no token and accessing chat or profile
  if (
    !AccessToken &&
    (url.pathname.startsWith("/chat") || url.pathname.startsWith("/profile"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
