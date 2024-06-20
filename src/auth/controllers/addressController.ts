import { Request, Response } from "express";
import { userType } from "./../../middleware/token/authMiddleware";
import Address from "../models/addressModel";
import {
  SuccessMessages,
  ErrorMessages,
  StatusCodes,
} from "../../validation/responseMessages";
import { validateMobileNumber, validatePinCode } from "../../helpers/helper";

// Saved User address
export const saveUserAddress = async (req: Request, res: Response) => {
  try {
    const {
      mobileNumber,
      country,
      stateId,
      stateName,
      cityId,
      cityName,
      streetAddress,
      nearByAddress,
      areaPincode,
    } = req.body;

    const user = req.user as userType;
    if (!user) {
      return {
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const userId = user.userId;

    const requiredFields = [
      "mobileNumber",
      "country",
      "stateName",
      "cityName",
      "streetAddress",
      "nearByAddress",
      "areaPincode",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return res.json({
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    if (!validateMobileNumber(mobileNumber)) {
      return res.json({
        message: ErrorMessages.InvalidMobileNumber,
        status: StatusCodes.ClientError.BadRequest,
        success: false,
      });
    }
    if (!validatePinCode(areaPincode)) {
      return res.json({
        message: ErrorMessages.InvalidPinCodeNumber,
        status: StatusCodes.ClientError.BadRequest,
        success: false,
      });
    }
    const newAddress = {
      loggedInUserId: userId,
      mobileNumber,
      country,
      stateId,
      stateName,
      cityId,
      cityName,
      streetAddress,
      nearByAddress,
      areaPincode,
    };
    const addressSaved = await Address.create(newAddress);
    if (addressSaved.id) {
      return res.json({
        message: SuccessMessages.AddressSuccess,
        status: StatusCodes.Success.Created,
        success: true,
        data: addressSaved,
      });
    } else {
      return res.json({
        message: ErrorMessages.AddressError,
        success: false,
        status: StatusCodes.ServerError.InternalServerError,
      });
    }
  } catch (error) {
    console.error("Error in save user address", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// get all user address
export const getAllUsersAddress = async (req: Request, res: Response) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const userId = user.userId;
    const foundUser = await Address.find({ loggedInUserId: userId });
    if (foundUser) {
      return res.json({
        message: SuccessMessages.AddressFound,
        status: StatusCodes.Success.Ok,
        success: true,
        addressData: foundUser,
      });
    }
    return res.json({
      message: ErrorMessages.AddressNotFound,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    });
  } catch (error) {
    console.error("Error in get user address", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// get user address by id
export const getUserAddressById = async (req: Request, res: Response) => {
  try {
    const { addressId } = req.params;
    const user = req.user as userType;
    if (!user) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const userId = user.userId;
    const foundUser = await Address.findOne({
      loggedInUserId: userId,
      _id: addressId,
    });
    if (foundUser) {
      return res.json({
        message: SuccessMessages.AddressFound,
        status: StatusCodes.Success.Ok,
        success: true,
        addressData: foundUser,
      });
    }
    return res.json({
      message: ErrorMessages.AddressNotFound,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    });
  } catch (error) {
    console.error("Error in get user address", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Update user address by id
export const updateUserAddress = async (req: Request, res: Response) => {
  try {
    const { addressId } = req.params;
    const {
      mobileNumber,
      country,
      stateId,
      stateName,
      cityId,
      cityName,
      streetAddress,
      nearByAddress,
      areaPincode,
    } = req.body;
    if (!addressId) {
      return res.json({
        message: ErrorMessages.AddressNotFound,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }

    if (mobileNumber && !validateMobileNumber(mobileNumber)) {
      return res.json({
        message: ErrorMessages.InvalidMobileNumber,
        status: StatusCodes.ClientError.BadRequest,
        success: false,
      });
    }

    if (areaPincode && !validatePinCode(areaPincode)) {
      return res.json({
        message: ErrorMessages.InvalidPinCodeNumber,
        status: StatusCodes.ClientError.BadRequest,
        success: false,
      });
    }

    const updatedFields: any = {};
    if (mobileNumber) updatedFields.mobileNumber = mobileNumber;
    if (country) updatedFields.country = country;
    if (stateId) updatedFields.stateId = stateId;
    if (stateName) updatedFields.stateName = stateName;
    if (cityId) updatedFields.cityId = cityId;
    if (cityName) updatedFields.cityName = cityName;
    if (streetAddress) updatedFields.streetAddress = streetAddress;
    if (nearByAddress) updatedFields.nearByAddress = nearByAddress;
    if (areaPincode) updatedFields.areaPincode = areaPincode;

    const addressUpdated = await Address.findByIdAndUpdate(
      addressId,
      { $set: updatedFields },
      { new: true }
    );

    if (addressUpdated) {
      return res.json({
        message: SuccessMessages.AddressUpdated,
        status: StatusCodes.Success.Ok,
        success: true,
      });
    } else {
      return res.json({
        message: ErrorMessages.AddressError,
        success: false,
        status: StatusCodes.ServerError.InternalServerError,
      });
    }
  } catch (error) {
    console.error("Error in update user address", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Delete a user address
export const deleteUserAddressById = async (req: Request, res: Response) => {
  try {
    const { addressId } = req.params;
    const subCategory = await Address.findById(addressId);
    if (!subCategory) {
      return res.json({
        message: ErrorMessages.AddressNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    await Address.deleteOne();
    return res.json({
      message: SuccessMessages.AddressDelete,
      status: StatusCodes.Success.Ok,
      success: true,
    });
  } catch (error) {
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
