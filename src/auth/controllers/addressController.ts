import { Request, Response } from "express";
import * as addressService from "../services/addressService";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Save user address
export const saveUserAddress = async (req: Request, res: Response) => {
  try {
    const result = await addressService.saveUserAddress(req.body, req);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in save user address", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// get all user address
export const getAllUsersAddress = async (req: Request, res: Response) => {
  try {
    const result = await addressService.getAllUsersAddress(req);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in get user address", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// get user address by id
export const getUserAddressById = async (req: Request, res: Response) => {
  try {
    const result = await addressService.getUserAddressById(
      req.params.addressId,
      req
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in get user address", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
