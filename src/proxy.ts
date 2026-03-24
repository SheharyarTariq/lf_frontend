import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routes } from "./utils/routes";

const protectedRoutes = [
  routes.ui.areas,
  routes.ui.category,
  routes.ui.orders,
  routes.ui.users,
];
const authRoutes = [routes.ui.signIn];

export function proxy(req: NextRequest) {
  const token = req.cookies.get("authtoken")?.value;
  const currentPath = req.nextUrl.pathname;

  let isAdmin = false;

  if (token) {
    try {
      const payloadBase64Url = token.split(".")[1];
      if (payloadBase64Url) {
        const payloadBase64 = payloadBase64Url
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        if (payload.roles && payload.roles.includes("ROLE_ADMIN")) {
          isAdmin = true;
        }
      }
    } catch (e) {
      console.error("Error decoding token in proxy", e);
    }
  }

  if (currentPath === routes.ui.indexRoute) {
    if (token && isAdmin) {
      return NextResponse.redirect(new URL(routes.ui.areas, req.url));
    }
    const response = NextResponse.redirect(new URL(routes.ui.signIn, req.url));
    if (token && !isAdmin) {
      response.cookies.delete("authtoken");
    }
    return response;
  }

  if (protectedRoutes.includes(currentPath)) {
    if (!token || !isAdmin) {
      const response = NextResponse.redirect(
        new URL(routes.ui.signIn, req.url)
      );
      if (token && !isAdmin) {
        response.cookies.delete("authtoken");
      }
      return response;
    }
  }

  if (authRoutes.includes(currentPath)) {
    if (token && isAdmin) {
      return NextResponse.redirect(new URL(routes.ui.areas, req.url));
    }
    if (token && !isAdmin) {
      const response = NextResponse.next();
      response.cookies.delete("authtoken");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/area", "/category", "/orders", "/users", "/auth/sign-in"],
};
