export const StatusCodes = {
  Success: {
    Created: 201,
    Ok: 200,
  },
  ClientError: {
    BadRequest: 400,
    Unauthorized: 401,
    NotFound: 404,
    Conflict: 409,
  },
  ServerError: {
    InternalServerError: 500,
  },
};

export const SuccessMessages = {
  ServerRunning: "Server is running... 🚀",
  DataBaseRunning: "Database connected... 👍",
  RoleCreated: "Role is created",
  SampelResponse: "Hello from Node js",
  RegisterSuccess: "Registration successful",
  SignInSuccess: "Sign-in successful",
  SignOutSuccess: "Sign-out successful",
  CategoriesSuccess: "Categorie created successfully",
  CategoriesFoundSuccess: "Categories found successfully",
  CategoriesDelete: "Categories delete successfully",
  CategoriesUpdate: "Categories updated successfully",
  SubCategoriesSuccess: "Subcategorie created successfully",
  SubCategoriesFoundSuccess: "Subcategories found successfully",
  SubCategoriesDelete: "Subcategorie delete successfully",
  SubCategoriesUpdate: "Subcategorie updated successfully",
  ProductSuccess: "Product created successfully",
  ProductFoundSuccess: "Product found successfully",
  ProductUpdatedSuccess: "Product updated successfully",
  ProductDeletedSuccess: "Product deleted successfully",
  CartSuccess: "Item added in cart",
  CartFoundSuccess: "Item found in cart",
  CartAlreadySuccess:
    "Iteam already exists in cart and quentity increased by 1",
  CartItemUpdated: "Cart updated",
  CartRemove: "Item removed from cart",
  PaymentSuccess: "Payment successful",
  PaymentFoundSuccess: "Payment details found successfully",
  UserFound: "User found",
  ForgotPasswordSuccess:
    "Reset password OTP has been sent to your email address",
  ResetPasswordSuccess: "Password reset successfully",
  ChangePasswordSuccess: "Password changed successfully",
  UserUpdatedSuccess: "User updated successfully",
  DataFound: "Data found",
  PdfInfo: "pdf info saved",
  AddressSuccess: "Address saved",
  AddressFound: "Address found",
  AddressUpdated: "Address updated",
  AddressDelete: "Address deleted",
  WishlistSuccess: "Wishlist saved",
  WishlistFound: "Wishlist found",
  WishlistDelete: "Wishlist removed",
  ReviewSuccess: "Review added successfully",
  ReviewFound: "Review found",
};

export const ErrorMessages = {
  ServerError: "Server is not running...😴",
  DatabaseError: "Database not connected...🥱",
  RoleError: "Error in creating role",
  RoleNotFound: "Role not found",
  RoleExist: "Role already exists",
  AuthorizeError: "Authorization header not found",
  AuthenticatError: "You are not authenticated!",
  TokenError: "Invalid token or token has expired",
  AccessError: "Unauthorized Access",
  TokenExpire: "Token has expired",
  UserNotFound: "User not found",
  EmailInvalid: "Invalid email format",
  EmalNotFound: "Email not found",
  EmailNotSend: "Email not sent",
  UserExists: (email: string) => `This ${email} email is already exists`,
  IncorrectCredentials: "Incorrect email or password",
  PasswordRequirements:
    "Password must have at least 8 characters,one uppercase, one lowercase, one digit, and one special character (#?!@$%^&*-)",
  InvalidMobileNumber: "Not a valide mobile number",
  InvalidPinCodeNumber: "Invalid pin code number",
  IncorrectOldPassword: "The old password does not match.",
  SamePasswordError: "The new password should not be the same as the old one.",
  SomethingWentWrong: "Something went wrong",
  RegisterError: "Error in register",
  LoginError: "Error in login",
  ProfileUpdateError: "Error updating profile",
  MissingFields: (missingFieldsMessage: string) =>
    ` ${missingFieldsMessage} field is required`,
  FileUploadError: "No file uploaded",
  CategoriesError: "Error in creating categorie",
  CategoriesNotFound: "Categories not found",
  CategoriesExists: "This category already exists.",
  SubcategoriesError: "Error in creating subcategorie",
  SubcategoriesNotFound: "Subcategories not foud",
  SubcategoriesExists: "This subcategory already exists.",
  ProductNotFound: "Product not found",
  ProductInvalid: "Invalid products data format",
  ProductError: "Error in creating product",
  ProductGetError: "Error in getting product",
  ProductUpdateError: "Error in updating product",
  ProductDeleteError: "Error in deleting product",
  CartError: "Error in creating cart",
  CartUpdateError: "Error in updating cart",
  CartNotFound: "Cart not found",
  QuantityCannotBeZero: "Quentity cannot be zero",
  PaymentError: "Error in creating payment details",
  PaymentNotFound: "Payment not found",
  ForgotPasswordError: "Faild to send otp",
  ResetPasswordsError: "Faild to reset password",
  PasswordSameError: "Confirm password and password must be the same",
  OtpError: "Invalid OTP or OTP expired",
  DataError: "Data not found",
  AddressError: "Error in creating address",
  AddressNotFound: "Address not found",
  WishlistNotFound: "Wishlist not found",
  WishlistAddError: "Error in creating wishlist",
  WishlistRemoveError: "Error in deleting wishlist",
  WishlistAlreadyExist: "This product already in you wishlist",
  ReviewNotFound: "Review not found",
  ReviewAddError: "Review not added",
  UserNotEligibleForReview: "You haven't purchase this product",
  UserLoginCheck: "Please login first to add or by this product",
  UserLoginRequire: "Please login first",
};
