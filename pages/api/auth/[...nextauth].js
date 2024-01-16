import NextAuth from "next-auth/next";
import Credentials from "next-auth/providers/credentials";

import { verifyPassword } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";

export default NextAuth({
  session: {
    jwt: true,
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const client = await connectToDatabase();
        try {
          const userCollection = client.db().collection("users");
          const user = await userCollection.findOne({
            email: credentials.email,
          });

          console.log("User found:", user);
          if (!user) {
            client.close();
            throw new Error("No user found!");
          }

          console.log("Stored hashed password:", user.password);
          const isValid = await verifyPassword(
            credentials.password,
            user.password
          );

          console.log("Provided password:", credentials.password);
          console.log("Password verification result:", isValid);

          if (!isValid) {
            client.close();
            throw new Error("Could not log you in");
          }

          console.log("Returning user email:", { email: user.email });

          client.close();
          return { email: user.email };
        } catch (error) {
          console.error("Error during authorization:", error);
          throw new Error("Authentication failed");
        } finally {
          client.close();
        }
      },
    }),
  ],
});
