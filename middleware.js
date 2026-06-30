import { NextResponse } from "next/server";

const publicPaths = [
  "/",
  "/pengumuman",
  "/galeri",
  "/pengurusan",
  "/login",
  "/register",
];

const adminPrefix = "/admin";
const userPrefix = "/user";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/peserta")) {
    const newPath = pathname.replace(/^\/peserta/, "/user");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  const token = request.cookies.get("lp3m_session")?.value;
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && pathname === "/register") {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  if (pathname.startsWith(adminPrefix) || pathname.startsWith(userPrefix)) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
