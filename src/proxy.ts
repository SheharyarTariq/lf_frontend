import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { routes } from "./components/common/utils/routes"

const protectedRoutes = [routes.ui.areas, routes.ui.category, routes.ui.orders, routes.ui.users, routes.ui.indexRoute]
const authRoutes = [routes.ui.signIn]

export function proxy(req: NextRequest) {
    const token = req.cookies.get("authtoken")?.value
    const currentPath = req.nextUrl.pathname

    if (protectedRoutes.includes(currentPath) && !token) {
        return NextResponse.redirect(new URL(routes.ui.signIn, req.url))
    }

    if (authRoutes.includes(currentPath) && token) {
        return NextResponse.redirect(new URL(routes.ui.areas, req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/", "/area", "/category", "/orders", "/users", "/auth/sign-in"],
}
