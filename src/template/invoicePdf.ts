export const downloadPdf = async (
  fullName: string,
  totalCartAmount: number,
  invoiceNumber: string,
  date: string,
  time: string,
  dayTime: string,
  productRowsHTML: string,
  orderNumber: string,
  mobileNumber: string,
  streetAddress: string,
  nearByAddress: string,
  cityName: string,
  stateName: string,
  areaPincode: string,
  country: string
) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Invoice</title>
      <style>
        body {
          font-family: "Arial", sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
        }
        .invoice-container {
          width: 80%;
          max-width: 800px;
          margin: 50px auto;
          padding: 30px;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #ddd;
          padding-bottom: 10px;
        }
        .invoice-header h1 {
          font-size: 28px;
          font-weight: bold;
          margin: 0;
          color: #333;
        }
        .invoice-header .billing-informations {
          text-align: right;
        }
        .invoice-header .billing-informations p {
          margin: 5px 0;
          font-size: 14px;
          color: #555;
        }
        .billing-information,
        .billing-informations {
          width: 48%;
        }
        .container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .billing-information h2,
        .billing-informations h2 {
          font-size: 20px;
          margin-bottom: 10px;
          color: #333;
        }
        .billing-information p,
        .billing-informations p {
          margin: 5px 0;
          font-size: 14px;
          color: #555;
        }
        .invoice-details table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .invoice-details th,
        .invoice-details td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
          text-align: left;
          font-size: 14px;
          color: #333;
        }
        .invoice-details th {
          background-color: #f5f5f5;
        }
        .invoice-summary {
          margin-top: 20px;
        }
        .invoice-summary table {
          width: 50%;
          float: right;
        }
        .invoice-summary th,
        .invoice-summary td {
          padding: 12px;
          font-size: 14px;
          color: #333;
        }
        .invoice-summary th {
          background-color: #f5f5f5;
        }
        .payment-information {
          margin-top: 30px;
        }
        .payment-information p {
          margin: 5px 0;
          font-size: 14px;
          color: #555;
        }
        .payment-instructions {
          font-weight: bold;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <h1>Invoice</h1>
          <div class="billing-informations">
            <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
            <p><strong>Order No:</strong> ${orderNumber}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time} ${dayTime}</p>
          </div>
        </div>
  
        <div class="container">
          <div class="billing-information">
            <h2>Billed To</h2>
            <p>${fullName}</p>
            <p>${streetAddress}, ${nearByAddress}</p>
            <p>${cityName}, ${stateName} - ${areaPincode} - ${country}</p>
            <p>91+ ${mobileNumber}</p>
          </div>
          <div class="billing-informations">
            <h2>From</h2>
            <p>ZipKart</p>
            <p>1231 Street, Modal Gram</p>
            <p>Ludhiana, Punjab-141002</p>
          </div>
        </div>
  
        <div class="invoice-details">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody id="productRows">
              ${productRowsHTML}
            </tbody>
          </table>
        </div>
  
        <div class="invoice-summary">
          <table>
            <tr>
              <th>Subtotal:</th>
              <td style="text-align:left">₹ ${totalCartAmount}</td>
            </tr>
          </table>
        </div>
  
        <div class="payment-information">
          <p class="payment-instructions">Payment Information:</p>
          <p><strong>Payment Method:</strong> Card</p>
          <p><strong>Payment Date:</strong> ${date}</p>
          <p><strong>Payment Time:</strong> ${time} ${dayTime}</p>
        </div>
      </div>
    </body>
  </html>
      `;
};
