import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        // We label it "Email or Phone", but the key is still 'email' 
        // because NextAuth's default sign-in form uses 'email' by convention.
        // Your frontend sends { email: formData.identifier } so this receives the input.
        email: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Basic Validation
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email/phone or password");
        }

        try {
          await connectToDatabase();

          // 2. 🟢 SEARCH LOGIC: Check both Email AND Phone fields
          // 'credentials.email' holds the input string (e.g., "017..." or "john@...")
          const user = await User.findOne({
            $or: [
              { email: credentials.email }, 
              { phone: credentials.email }
            ]
          }).select("+password"); // Vital: Get password for comparison

          if (!user) {
            throw new Error("No user found with this email or phone");
          }

          // 3. Verify Password
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }

          // 4. Return User Data (Stored in Session)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user",
            image: user.image
          };
        } catch (error) {
          console.error("Auth error: ", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
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
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};