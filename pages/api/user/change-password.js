import { getSession } from "next-auth/react";
import { connectToDatabase } from "../../../lib/db";
import { hashPassword, verifyPassword } from "../../../lib/auth";

async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).end();
  }

  try {
    const session = await getSession({ req: req });
    console.log("Session:", session);

    if (!session) {
      res.status(401).json({ message: "Not authencated!" });

      return;
    }

    const userEmail = session.user.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const client = await connectToDatabase();

    const userCollection = client.db().collection("users");

    const user = await userCollection.findOne({ email: userEmail });

    if (!user) {
      res.status(404).json({ message: "User not found!" });
      client.close();
      return;
    }

    const currentPassword = user.password;
    const passwordsAreEqual = await verifyPassword(
      oldPassword,
      currentPassword
    );

    if (!passwordsAreEqual) {
      res.status(403).json({ message: "Invalid password!" });
      client.close();
      return;
    }

    const hashedPassword = await hashPassword(newPassword);

    const result = await userCollection.updateOne(
      { email: userEmail },
      { $set: { password: hashedPassword } }
    );

    client.close();
    res.status(200).json({ message: "Password updated!" });
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export default handler;
