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
    NotFound: 404,
  },
  ServerError: {
    InternalServerError: 500,
  },
};

export const SuccessMessages = {
  RegisterSuccess: "Register successful",
  SignInSuccess: "Signed In successful",
  ProductSuccess: "Product created successfully",
  ProductFoundSuccess: "Product found successfully",
  CartSuccess: "Iteam added in cart",
  CartUpdateSuccess: "Iteam updated in cart",
  CartFoundSuccess: "Found Iteam in cart",
};

export const ErrorMessages = {
  EmailInvalid: "Invalid email format",
  UserExists: (email: string) => `This email ${email} is already exists`,
  PasswordRequirements:
    "Password must have at least 8 characters, including at least one uppercase letter, one lowercase letter, one digit, and one special character (#?!@$%^&*-)",
  UserNotFound: "User not found",
  IncorrectCredentials: "Incorrect email or password",
  SomethingWentWrong: "Something went wrong",
  RegisterError: "Error in register",
  LoginError: "Error in login",
  MissingFields: (missingFieldsMessage: string) =>
    ` ${missingFieldsMessage} field is required`,
  ProductNotFound: "Product not found",
  ProductError: "Error in creating product",
  FileUploadError: "No file uploaded",
  CartError: "Error in creating cart",
};
