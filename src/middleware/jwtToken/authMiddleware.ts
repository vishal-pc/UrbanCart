import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { envConfig } from "../../config/envConfig";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Define a new interface that extends the Express Request interface
export interface CustomRequest extends Request {
  user?: userType;
}

export interface userType {
  exp: number;
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
    return res.status(StatusCodes.ClientError.NotFound).json({
      message: ErrorMessages.AuthorizeError,
      success: false,
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(StatusCodes.ClientError.BadRequest).json({
      message: ErrorMessages.AuthenticatError,
      success: false,
    });
  }

  try {
    const decodedToken = jwt.verify(token, envConfig.Jwt_Secret) as userType;

    if (!decodedToken) {
      return res.status(StatusCodes.ClientError.NotFound).json({
        message: ErrorMessages.TokenError,
        success: false,
      });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      return res.status(StatusCodes.ClientError.BadRequest).json({
        message: ErrorMessages.TokenExpire,
        success: false,
      });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(StatusCodes.ClientError.NotFound).json({
      message: ErrorMessages.TokenError,
      success: false,
    });
  }
};

export const verifyAdminToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as userType;

  if (!user || user.type !== "admin") {
    return res.status(StatusCodes.ClientError.NotFound).json({
      message: ErrorMessages.AccessError,
      success: false,
    });
  }

  next();
};
