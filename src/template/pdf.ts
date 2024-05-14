export const downloadPdf = async (
  fullName: string,
  totalCartAmount: number,
  invoiceNumber: string,
  date: string,
  time: string,
  productRowsHTML: string
) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
      <style>
        .invoice-title {
          text-align: end;
          font-size: 24px;
          font-weight: bold;
        }
  
        .billing-information {
          text-align: left;
        }
  
        .billing-informations {
          text-align: right;
        }
  
        .bodys {
          font-family: sans-serif;
          margin: 0;
          padding: 0;
        }
  
        .invoice-container {
          width: 700px;
          margin: 50px auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
  
        .invoice-header {
          display: flex;
          justify-content: end;
          margin-bottom: 30px;
        }
  
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
        }
  
        .billing-information {
          text-align: left;
        }
        .billing-informations {
          text-align: right;
        }
  
        .container {
          display: flex;
          justify-content: space-between;
        }
  
        .invoice-details {
          border-collapse: collapse;
          width: 100%;
          margin-top: 10%;
        }
  
        .invoice-details thead th {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
  
        .invoice-details tbody td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
  
        .invoice-summary {
          margin-top: 30px;
          margin-left: 60%;
        }
  
        .invoice-summary table {
          width: 100%;
        }
  
        .invoice-summary table tr th,
        .invoice-summary table tr td {
          padding: 10px;
        }
  
        .payment-information {
          margin-top: 30px;
        }
  
        .payment-instructions {
          font-weight: bold;
        }
  
        .table-start {
          width: 100%;
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="bodys">
        <div class="invoice-container">
          <div class="invoice-header">
            <h1 class="invoice-title">Invoice</h1>
          </div>
  
          <div class="container">
            <div class="billing-information">
              <h1>Billed To</h1>
              <p>${fullName}</p>
              <p>143, Sector 71, Mohali-160071</p>
              <p>91+ 1234567890</p>
            </div>
  
            <div class="billing-informations">
              <h1>Invoice No:- ${invoiceNumber}</h1>
            </div>
          </div>
  
          <div class="invoice-details">
            <table class="table-start">
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
              <tbody>
                <tr>
                  <th>Subtotal</th>
                  <td>₹ ${totalCartAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <div class="container mt-5">
            <div class="payment-information">
              <p class="payment-instructions">Payment Information:</p>
              <p>Payment Method : Card</p>
              <p>Payment Date : ${date}</p>
              <p>Payment Time : ${time}</p>
            </div>
  
            <div class="payment-information">
              <p class="payment-instructions">From ZipKart</p>
              <p>1231 Street, Modal Gram</p>
              <p>Ludhiana, Punjab-141002</p>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
  
      `;
};
