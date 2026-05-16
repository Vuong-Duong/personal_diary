import { type NextRequest, NextResponse } from "next/server";

const roleBasedPaths: { [key: string]: string[] } = {
  "/profile": ["user"],
  "/diaryPrivate": ["user"],
  "/adminPage": ["admin"],
};

export interface DecodedToken {
  exp: number;
  role: string;
  user: string;
}

export function proxy(request: NextRequest) {
  const hasRefreshToken = Boolean(request.cookies.get("refreshToken")?.value);
  const path = request.nextUrl.pathname;

  if (path === "/admin/login" || path === "/marketing/login") {
    return NextResponse.next();
  }

  const requiredRoles = Object.entries(roleBasedPaths).find(
    ([route]) => path === route || path.startsWith(`${route}/`),
  )?.[1];

  const getLoginUrl = () => {
    if (path.startsWith("/admin")) {
      return "/admin/login";
    }
    if (path.startsWith("/marketing")) {
      return "/marketing/login";
    }
    return "/login";
  };

  // Frontend middleware only checks whether a refresh-token session exists.
  // Backend protected APIs still enforce the actual user role.
  if (requiredRoles && !hasRefreshToken) {
    const url = new URL(getLoginUrl(), request.url);
    const relativeCallback = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    url.searchParams.set("callbackUrl", relativeCallback);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
