import express, { Request, Response } from "express";
import passport from "passport";
import "../../config/dbConfig";
import "./googleModule";
import jwt from "jsonwebtoken";
import { envConfig } from "../../config/envConfig";
import Auth, { IAuth } from "../../auth/models/authModel";


const jwtSecret: string = envConfig.Jwt_Secret;
const jwtExpire: string = envConfig.Jwt_Expiry_Hours;
const clientUrl: string = envConfig.client_Url;

const router = express.Router();


// Google login route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${clientUrl}?token=error`,
  }),
  async (req: Request, res: Response) => {
    const user = req.user as IAuth;
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    try {
      await Auth.populate(user, { path: 'role' });
      const { _id: userId, fullName, email, provider, role } = user;

      const userData = {
        userId,
        role,
        fullName,
        email,
        provider,
      };
      const token = jwt.sign(userData, jwtSecret!, { expiresIn: jwtExpire });
      res.redirect(`${clientUrl}?token=${token}`);
    } catch (error) {
      res.status(500).json({ message: "Error generating token" });
    }
  }
);


// Verify token
router.get("/verify", async (req: Request, res: Response) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ message: "Token not found" });
    }
    const decoded = jwt.verify(token as string, jwtSecret!);

    if (!decoded) {
      return res.status(400).json({ message: "Invalid token" });
    }

    return res.status(200).json({ message: "Token verified", data: decoded });
  } catch (error) {
    return res.status(400).json({ message: "Token not verified", error });
  }
});

export default router;