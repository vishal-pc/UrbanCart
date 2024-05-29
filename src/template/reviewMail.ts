export const sendMailForReview = (fullName: string, productName: string) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Product Review Email</title>
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
        <strong style="font-size: 24px">Hi ${fullName} 🖐️,</strong>
        <p style="font-size: 16px">Thank you for being a valued customer !</p>
        <p>
          We value your opinion and We’d loved your feedback on your recent
          purchase product <strong>${productName}</strong>. 😀
        </p>
        <p>Your feedback means the world to us!</p>
        <p style="font-size: 18px; font-weight: bold">
          Thank you for being a part of our journey!
        </p>
        <p style="font-size: 16px; font-weight: bold">
          Best regards,<br />UrbanCart 🛒
        </p>
      </div>
    </body>
  </html>
  
      `;
};
