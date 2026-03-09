import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    // ゲストログイン用 Credentials プロバイダー
    Credentials({
      credentials: {
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        const guestPassword = process.env.GUEST_PASSWORD;
        if (!guestPassword) return null;
        if (credentials.password === guestPassword) {
          return { id: "guest", name: "ゲスト", email: "guest@local" };
        }
        return null;
      },
    }),
  ],
  // Credentials プロバイダーは JWT strategy が必須
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    signIn({ user, account }) {
      // Credentials プロバイダーは authorize() で認証済みなので通過
      if (account?.provider === "credentials") return true;
      return allowedEmails.includes(user.email ?? "");
    },
  },
});
