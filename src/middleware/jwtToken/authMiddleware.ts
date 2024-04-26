import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { envConfig } from "../../config/envConfig";

// Define a new interface that extends the Express Request interface
export interface CustomRequest extends Request {
  user?: userType;
}

export interface userType {
  userId: string | JwtPayload;
  type: string;
}

export const verifyAuthToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authorization header not found",
      success: false,
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "You are not authenticated!",
      success: false,
    });
  }

  try {
    const decodedToken = jwt.verify(token, envConfig.Jwt_Secret);

    if (typeof decodedToken !== "object" || decodedToken === null) {
      return res.status(401).json({
        message: "Invalid token!",
        success: false,
      });
    }

    req.user = decodedToken as userType;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "You are not authenticated!",
      success: false,
    });
  }
};

export const verifyAdminToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as userType;
    if (user.type === "admin") {
      next();
    } else {
      throw new Error();
    }
  } catch (err) {
    res.status(401).send({
      message: "Unauthorized Access",
      status: false,
    });
  }
};
