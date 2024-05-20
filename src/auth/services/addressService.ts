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
import { validateMobileNumber, validatePinCode } from "../../helpers/helper";

// Saved User address
export const saveUserAddress = async (addressData: any, req: CustomRequest) => {
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
      "stateName",
      "cityName",
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
    if (!validateMobileNumber(mobileNumber)) {
      return {
        message: ErrorMessages.InvalidMobileNumber,
        status: StatusCodes.ClientError.BadRequest,
        success: false,
      };
    }
    if (!validatePinCode(areaPincode)) {
      return {
        message: ErrorMessages.InvalidPinCodeNumber,
        status: StatusCodes.ClientError.BadRequest,
        success: false,
      };
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

// Update user address by id
export const updateUserAddress = async (
  addressId: string,
  addressData: any
) => {
  try {
    if (!addressId) {
      return {
        message: ErrorMessages.AddressNotFound,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }

    if (
      addressData.mobileNumber &&
      !validateMobileNumber(addressData.mobileNumber)
    ) {
      return {
        message: ErrorMessages.InvalidMobileNumber,
        status: StatusCodes.ClientError.BadRequest,
        success: false,
      };
    }

    if (addressData.areaPincode && !validatePinCode(addressData.areaPincode)) {
      return {
        message: ErrorMessages.InvalidPinCodeNumber,
        status: StatusCodes.ClientError.BadRequest,
        success: false,
      };
    }

    const updatedFields: any = {};
    if (addressData.mobileNumber)
      updatedFields.mobileNumber = addressData.mobileNumber;
    if (addressData.country) updatedFields.country = addressData.country;
    if (addressData.stateId) updatedFields.stateId = addressData.stateId;
    if (addressData.stateName) updatedFields.stateName = addressData.stateName;
    if (addressData.cityId) updatedFields.cityId = addressData.cityId;
    if (addressData.cityName) updatedFields.cityName = addressData.cityName;
    if (addressData.streetAddress)
      updatedFields.streetAddress = addressData.streetAddress;
    if (addressData.nearByAddress)
      updatedFields.nearByAddress = addressData.nearByAddress;
    if (addressData.areaPincode)
      updatedFields.areaPincode = addressData.areaPincode;

    const addressUpdated = await Address.findByIdAndUpdate(
      addressId,
      { $set: updatedFields },
      { new: true }
    );

    if (addressUpdated) {
      return {
        message: SuccessMessages.AddressUpdated,
        status: StatusCodes.Success.Ok,
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
    console.error("Error in update user address", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Delete a user address
export const deleteUserAddressById = async (addressId: string) => {
  try {
    const subCategory = await Address.findById(addressId);
    if (!subCategory) {
      return {
        message: ErrorMessages.AddressNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    await Address.deleteOne();
    return {
      message: SuccessMessages.AddressDelete,
      status: StatusCodes.Success.Ok,
      success: true,
    };
  } catch (error) {
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
