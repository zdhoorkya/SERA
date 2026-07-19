import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Sera Studio",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "editor@sera.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.active) {
          throw new Error("No active user found with that email");
        }

        const isPasswordValid = bcrypt.compareSync(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.name = user.name;
      } else if (token.id) {
        // Query database to retrieve the latest name and role to keep session fresh
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: parseInt(token.id as string, 10) },
            select: { name: true, role: true }
          });
          if (dbUser) {
            token.name = dbUser.name;
            token.role = dbUser.role;
          }
        } catch (e) {
          console.error("Failed to fetch fresh user info in JWT callback:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/studio/login",
    error: "/studio/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "sera-production-secret-key-2026-primpla",
};
