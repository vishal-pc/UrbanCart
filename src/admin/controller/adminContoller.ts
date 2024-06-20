import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Auth, { IAuth } from "../../auth/models/authModel";
import { emailValidate, passwordRegex } from "../../helpers/helper";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";
import { userType } from "../../middleware/token/authMiddleware";
import Product from "../models/productModel";
import Payment from "../../auth/models/paymentModel";
import Address, { IAddress } from "../../auth/models/addressModel";
import { getMonthName } from "../../helpers/monthName";

// Register admin
export const registerAdmin = async (req: Request, res: Response) => {
  const { fullName, email, password, role } = req.body;
  try {
    const requiredFields = ["fullName", "email", "password", "role"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return res.json({
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    if (!emailValidate(email)) {
      return res.json({
        message: ErrorMessages.EmailInvalid,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.json({
        message: ErrorMessages.UserExists(email),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    // Validate password strength
    if (!passwordRegex.test(password)) {
      return res.json({
        message: ErrorMessages.PasswordRequirements,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      fullName,
      email,
      password: hashedPassword,
      IsAdmin: true,
      role,
    };

    const userSaved = await Auth.create(newUser);
    if (userSaved.id) {
      return res.json({
        message: SuccessMessages.RegisterSuccess,
        status: StatusCodes.Success.Created,
        success: true,
      });
    } else {
      return res.json({
        message: ErrorMessages.RegisterError,
        success: false,
        status: StatusCodes.ServerError.InternalServerError,
      });
    }
  } catch (error) {
    console.error("Error in register", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
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
    const { searchQuery } = req.query;
    let filter: any = {};

    if (searchQuery) {
      filter.$or = [
        { fullName: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ];
      const searchNumber = Number(searchQuery);
      if (!isNaN(searchNumber)) {
        filter.$or.push({ mobileNumber: searchNumber });
      }
    }

    const users = await Auth.find(filter).populate("role", "role");
    if (!users) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }

    const filteredUsers = users.filter(
      (u: IAuth) => u._id.toString() !== userId
    );

    const userData = filteredUsers.map((user: IAuth) => ({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber:
        user.mobileNumber !== undefined ? user.mobileNumber.toString() : "null",
      profileImg: user.profileImg || "null",
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    const totalCount = filteredUsers.length;

    return res.json({
      message: SuccessMessages.UserFound,
      status: StatusCodes.Success.Ok,
      success: true,
      totalCount,
      userData,
    });
  } catch (error) {
    console.error("Error in getting users", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      status: StatusCodes.ServerError.InternalServerError,
      success: false,
    });
  }
};

// Get total number of order details
export const getTotalOrderDetails = async (req: Request, res: Response) => {
  try {
    const { searchQuery } = req.query;
    let filter: any = {};

    if (searchQuery) {
      const buyerUserDetails = await Auth.find({
        $or: [
          { fullName: { $regex: `^${searchQuery}$`, $options: "i" } },
          { email: { $regex: `^${searchQuery}$`, $options: "i" } },
        ],
      }).distinct("_id");

      const findProductDetails = await Product.find({
        $or: [
          { productName: { $regex: `^${searchQuery}$`, $options: "i" } },
          { productDescription: { $regex: `^${searchQuery}$`, $options: "i" } },
        ],
      }).distinct("_id");

      const findAddressDetails = await Address.find({
        $or: [
          { cityName: { $regex: `^${searchQuery}$`, $options: "i" } },
          { stateName: { $regex: `^${searchQuery}$`, $options: "i" } },
          { streetAddress: { $regex: `^${searchQuery}$`, $options: "i" } },
          { nearByAddress: { $regex: `^${searchQuery}$`, $options: "i" } },
        ],
      }).distinct("_id");

      filter.$or = [
        { buyerUserId: { $in: buyerUserDetails } },
        {
          totalProduct: {
            $elemMatch: { productId: { $in: findProductDetails } },
          },
        },
        { addressId: { $in: findAddressDetails } },
      ];
      const searchNumber = Number(searchQuery);
      if (!isNaN(searchNumber)) {
        filter.$or.push({ totalCartAmount: searchNumber });
      }
    }
    const totalCount = await Payment.countDocuments(filter);
    const completedCount = await Payment.countDocuments({
      ...filter,
      paymentStatus: "Completed",
    });
    const pendingCount = await Payment.countDocuments({
      ...filter,
      paymentStatus: "Pending",
    });
    const allPayments = await Payment.find(filter)
      .populate("buyerUserId")
      .populate("addressId");

    const paymentData = allPayments.map((payment) => ({
      _id: payment?._id,
      stripeUserId: payment?.stripeUserId,
      paymentStatus: payment?.paymentStatus,
      orderNumber: payment?.orderNumber,
      totalCartAmount:
        payment.totalCartAmount !== undefined
          ? payment.totalCartAmount.toString()
          : "null",
      buyerUserId: {
        buyerUserId: payment?._id,
        email: (payment?.buyerUserId as any as IAuth)?.email,
        fullName: (payment?.buyerUserId as any as IAuth)?.fullName,
      },
      addressId: {
        addressId: payment?._id,
        cityName: (payment?.userAddress[0].addressId as any as IAddress)
          ?.cityName,
        stateName: (payment?.userAddress[0].addressId as any as IAddress)
          ?.stateName,
        streetAddress: (payment?.userAddress[0].addressId as any as IAddress)
          ?.streetAddress,
        nearByAddress: (payment?.userAddress[0].addressId as any as IAddress)
          ?.nearByAddress,
      },
      totalProduct: payment?.totalProduct,
      createdAt: payment?.createdAt,
      updatedAt: payment?.updatedAt,
    }));

    const totalByProductCount = paymentData
      .filter((payment) => payment.paymentStatus === "Completed")
      .reduce((count, payment) => count + payment.totalProduct.length, 0);

    if (allPayments.length > 0) {
      return res.json({
        message: SuccessMessages.PaymentFoundSuccess,
        status: StatusCodes.Success.Ok,
        success: true,
        totalPaymentCount: totalCount,
        totalByproductCount: totalByProductCount,
        successPaymentCount: completedCount,
        pendingPaymentCount: pendingCount,
        payments: paymentData,
      });
    } else {
      return res.json({
        message: ErrorMessages.PaymentNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
  } catch (error) {
    console.error("Error in getting all payment details", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      status: StatusCodes.ServerError.InternalServerError,
      success: false,
    });
  }
};

// Get total number of order payment details
export const getTotalNumberOfOrderPaymentsDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const completedPayments = await Payment.find({
      paymentStatus: "Completed",
    });

    if (completedPayments.length === 0) {
      return res.json({
        message: ErrorMessages.PaymentNotFound,
        status: StatusCodes.ClientError.NotFound,
        success: false,
        totalRevenue: 0,
        monthlyRevenue: [],
      });
    } else {
      let totalRevenue: number = 0;
      completedPayments.forEach((payment) => {
        totalRevenue += payment.totalCartAmount;
      });

      // Aggregation for monthly revenue
      const monthlyRevenue = await Payment.aggregate([
        { $match: { paymentStatus: "Completed" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            monthlyTotal: { $sum: "$totalCartAmount" },
          },
        },
        {
          $sort: {
            "_id.year": -1,
            "_id.month": -1,
          },
        },
        { $limit: 12 },
      ]);

      // Format the monthlyRevenue
      const formattedMonthlyRevenue = monthlyRevenue.map((month) => ({
        year: month._id.year,
        month: getMonthName(month._id.month),
        total: month.monthlyTotal,
      }));

      return res.json({
        message: SuccessMessages.PaymentFoundSuccess,
        status: StatusCodes.Success.Ok,
        success: true,
        totalRevenue: totalRevenue,
        monthlyRevenue: formattedMonthlyRevenue,
      });
    }
  } catch (error) {
    console.error("Error in getting total payment revenue", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      status: StatusCodes.ServerError.InternalServerError,
      success: false,
    });
  }
};
