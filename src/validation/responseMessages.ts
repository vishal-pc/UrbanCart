export const StatusCodes = {
  Success: {
    Created: 201,
    Ok: 200,
  },
  DataFound: {
    Found: 302,
  },
  ClientError: {
    BadRequest: 400,
    Unauthorized: 401,
    NotFound: 404,
  },
  ServerError: {
    InternalServerError: 500,
  },
};

export const SuccessMessages = {
  ServerRunning: "Server is running... 🚀",
  DataBaseRunning: "Database Connected...👍️",
  SampelResponse: "Hello from Node js",
  RegisterSuccess: "Register successful",
  SignInSuccess: "Signed In successful",
  ProductSuccess: "Product created successfully",
  ProductFoundSuccess: "Product found successfully",
  ProductUpdatedSuccess: "Product updated successfully",
  ProductDeletedSuccess: "Product deleted successfully",
  CartSuccess: "Iteam added in cart",
  CartFoundSuccess: "Found Iteam in cart",
  CartItemUpdated: "Cart Updated",
  CartRemove: "Iteam removed",
  PaymentSuccess: "Payment successful",
};

export const ErrorMessages = {
  ServerError: "Server is not running...😴",
  DatabaseError: "Database not connected...🥱",
  AuthorizeError: "Authorization header not found",
  AuthenticatError: "You are not authenticated!",
  TokenError: "Invalid token!",
  AccessError: "Unauthorized Access",
  TokenExpire: "Token has expired",
  UserNotFound: "User not found",
  EmailInvalid: "Invalid email format",
  UserExists: (email: string) => `This email ${email} is already exists`,
  IncorrectCredentials: "Incorrect email or password",
  PasswordRequirements:
    "Password must have at least 8 characters, including at least one uppercase letter, one lowercase letter, one digit, and one special character (#?!@$%^&*-)",
  SomethingWentWrong: "Something went wrong",
  RegisterError: "Error in register",
  LoginError: "Error in login",
  MissingFields: (missingFieldsMessage: string) =>
    ` ${missingFieldsMessage} field is required`,
  FileUploadError: "No file uploaded",
  ProductNotFound: "Product not found",
  ProductInvalid: "Invalid products data format",
  ProductError: "Error in creating product",
  ProductUpdateError: "Error in updating product",
  ProductDeleteError: "Error in deleting product",
  CartError: "Error in creating cart",
  CartNotFound: "Cart not found",

  PaymentError: "Error in creating payment",
};
