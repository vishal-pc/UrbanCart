import {
  userType,
  CustomRequest,
} from "./../../middleware/token/authMiddleware";
import Address from "../models/addressModel";
import {
  SuccessMessages,
  ErrorMessages,
  StatusCodes,
} from "../../validation/responseMessages";

// Saved User address
export const saveUserAddress = async (addressData: any, req: CustomRequest) => {
  try {
    const {
      mobileNumber,
      country,
      state,
      city,
      streetAddress,
      nearByAddress,
      areaPincode,
    } = addressData;

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
      "state",
      "city",
      "streetAddress",
      "nearByAddress",
      "areaPincode",
    ];
    const missingFields = requiredFields.filter((field) => !addressData[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return {
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
    const newAddress = {
      loggedInUserId: userId,
      mobileNumber,
      country,
      state,
      city,
      streetAddress,
      nearByAddress,
      areaPincode,
    };
    const addressSaved = await Address.create(newAddress);
    if (addressSaved.id) {
      return {
        message: SuccessMessages.AddressSuccess,
        status: StatusCodes.Success.Created,
        success: true,
      };
    } else {
      return {
        message: ErrorMessages.AddressError,
        success: false,
        status: StatusCodes.ServerError.InternalServerError,
      };
    }
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
export const getAllUsersAddress = async (req: CustomRequest) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return {
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const userId = user.userId;
    const foundUser = await Address.find({ loggedInUserId: userId });
    if (foundUser) {
      return {
        message: SuccessMessages.AddressFound,
        status: StatusCodes.Success.Ok,
        success: true,
        addressData: foundUser,
      };
    }
    return {
      message: ErrorMessages.AddressNotFound,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    };
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
export const getUserAddressById = async (
  addressId: string,
  req: CustomRequest
) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return {
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const userId = user.userId;
    const foundUser = await Address.findOne({
      loggedInUserId: userId,
      _id: addressId,
    });
    if (foundUser) {
      return {
        message: SuccessMessages.AddressFound,
        status: StatusCodes.Success.Ok,
        success: true,
        addressData: foundUser,
      };
    }
    return {
      message: ErrorMessages.AddressNotFound,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    };
  } catch (error) {
    console.error("Error in get user address", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
