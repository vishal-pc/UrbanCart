// password validation
export const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

// email validation
export const emailValidate = (email: string) => {
  if (
    String(email).match(
      /^[A-Za-z0-9._%-]+@(?:[A-Za-z0-9]+\.)+(com|co\.in|yahoo\.com)$/
    )
  ) {
    return true;
  } else {
    return false;
  }
};

// mobile number validation
export const validateMobileNumber = (mobileNumber: string): boolean => {
  const indianMobileRegex = /^[789]\d{9}$/;
  return indianMobileRegex.test(mobileNumber);
};

// pincode validation
export const validatePinCode = (pinCode: string): boolean => {
  const indianPinCodeRegex = /^\d{6}$/;
  return indianPinCodeRegex.test(pinCode);
};
