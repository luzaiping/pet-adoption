import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export default {
  providers: [],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = pathname.startsWith('/dashboard');
      const isOnDashboardAdmin = pathname.startsWith('/dashboard/admin');

      if (!isOnDashboard) return true;
      if (!isLoggedIn) return false;

      // /dashboard/forbidden itself is outside /dashboard/admin,
      // so it's never re-checked here — no redirect loop.
      if (isOnDashboardAdmin && auth?.user?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/forbidden', request.url));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    }
  }
} satisfies NextAuthConfig;
