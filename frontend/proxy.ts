import { jwtDecode } from "jwt-decode";
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
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // Allow access to admin and marketing login pages explicitly
  if (path === "/admin/login" || path === "/marketing/login") {
    return NextResponse.next();
  }

  const requiredRoles = Object.entries(roleBasedPaths).find(
    ([route]) => path === route || path.startsWith(`${route}/`),
  )?.[1];

  // Helper to determine login URL based on path
  const getLoginUrl = () => {
    if (path.startsWith("/admin")) {
      return "/admin/login";
    }
    if (path.startsWith("/marketing")) {
      return "/marketing/login";
    }
    return "/login";
  };

  // Route yêu cầu role nhưng chưa login
  if (requiredRoles && !token) {
    const url = new URL(getLoginUrl(), request.url);
    const relativeCallback = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    url.searchParams.set("callbackUrl", relativeCallback);
    return NextResponse.redirect(url);
  }

  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      // Token hết hạn
      if (decoded.exp < currentTime) {
        const response = NextResponse.redirect(
          new URL(getLoginUrl(), request.url),
        );
        response.cookies.delete("token");
        return response;
      }

      // Kiểm tra role
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        // Nếu không đúng role, redirect về trang login phù hợp
        const response = NextResponse.redirect(
          new URL(getLoginUrl(), request.url),
        );
        // response.cookies.delete("token"); // Có thể giữ token nếu muốn switch account? Thường là xóa
        response.cookies.delete("token");
        return response;
      }
    } catch {
      const response = NextResponse.redirect(
        new URL(getLoginUrl(), request.url),
      );
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
