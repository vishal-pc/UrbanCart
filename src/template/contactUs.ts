export const contactUsMail = (
  adminFullName: string,
  fullName: string,
  productName: string,
  reasonForContact: string,
  userName: string,
  userMobileNumber: number,
  userEmail: string,
  userComment: string
) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Product Feedback Email</title>
    </head>
    <body
      style="
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        padding: 20px;
      "
    >
      <div
        style="
          background-color: #fff;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
        "
      >
        <strong style="font-size: 24px">Hi ${adminFullName} 🖐️,</strong>
        <p style="font-size: 16px">
          A new review has been submitted for the product <strong>${productName}</strong>
        </p>
        <p>Reason Of Contact: ${reasonForContact}</p>
        <p>Submited By: ${fullName}</p>
        <p>User Name: ${userName}</p>
        <p>User Email: ${userEmail}</p>
        <p>User M.No: ${userMobileNumber}</p>
        <p>Comment: ${userComment}</p>
        <p style="font-size: 16px; font-weight: bold">
          Best regards,<br />UrbanCart 🛒
        </p>
      </div>
    </body>
  </html>
        `;
};
