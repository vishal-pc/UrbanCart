export const passwordResetTemplate = (fullName: string, otp: string) => `
<strong>Hi ${fullName} ...🖐️,</strong>
<p>Forgot your password! ...😮‍💨 <br>We received a request to reset the password for you account ...😀</br></p>
<p>If you did not make this request then please ignore this email ...🙂</p>
<p><strong>Otherwise, here is your OTP for password reset:- ${otp} ...👍️</strong></p>
<p>Best regards,<br>Your Company Name</br></p>
`;
