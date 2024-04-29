import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { envConfig } from "../../config/envConfig";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

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
    return {
      message: ErrorMessages.AuthorizeError,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    };
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return {
      message: ErrorMessages.AuthenticatError,
      success: false,
      status: StatusCodes.ClientError.BadRequest,
    };
  }

  try {
    const decodedToken = jwt.verify(token, envConfig.Jwt_Secret);

    if (typeof decodedToken !== "object" || decodedToken === null) {
      return {
        message: ErrorMessages.TokenError,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      return {
        message: ErrorMessages.TokenExpire,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
    req.user = decodedToken as userType;

    next();
  } catch (error) {
    return {
      message: ErrorMessages.AuthenticatError,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    };
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
      return {
        message: ErrorMessages.AccessError,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
  } catch (err) {
    return {
      message: ErrorMessages.TokenError,
      success: false,
      status: StatusCodes.ClientError.BadRequest,
    };
  }
};
