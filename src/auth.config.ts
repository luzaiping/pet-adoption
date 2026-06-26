import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export default {
  providers: [],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard');
      return isOnDashboard ? isLoggedIn : true;
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
