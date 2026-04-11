import { penceToPounds } from "@/utils/helper";

export interface OrderItemForPrint {
  item: any;
  quantity: number;
  openItemName: string | null;
  cleaningMethod: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface ItemOptionForPrint {
  id: string;
  atId: string;
  name: string;
}

export interface OrderInfoForPrint {
  orderNumber?: number;
  createdAt?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  pickupDate?: string;
  dropoffDate?: string;
}

export interface PrintTicketsParams {
  orderItems: OrderItemForPrint[];
  allItems: ItemOptionForPrint[];
  orderId: string;
  orderInfo?: OrderInfoForPrint;
  cleaningMethodMap: Record<string, string>;
}

export const printTickets = ({
  orderItems,
  allItems,
  orderId,
  orderInfo,
  cleaningMethodMap,
}: PrintTicketsParams) => {
  const totalRevenue = orderItems
    .reduce(
      (acc, item) => acc + (penceToPounds(Number(item.totalPrice)) || 0),
      0
    )
    .toFixed(2);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const itemRows = orderItems
    .map((item) => {
      const itemName =
        item.item && typeof item.item === "object" && item.item.name
          ? item.item.name
          : item.openItemName
            ? item.openItemName
            : typeof item.item === "string"
              ? allItems.find(
                  (i) => i.atId === item.item || `/items/${i.id}` === item.item
                )?.name || item.item
              : "—";
      const cleaningLabel =
        cleaningMethodMap[item.cleaningMethod] || item.cleaningMethod;
      const unitPrice = penceToPounds(item.pricePerUnit).toFixed(2);
      const totalPrice = penceToPounds(item.totalPrice).toFixed(2);
      return `
        <tr>
          <td>${itemName}</td>
          <td style="text-align:center">${item.quantity}</td>
          <td style="text-align:center">${cleaningLabel}</td>
          <td style="text-align:right">£${unitPrice}</td>
          <td style="text-align:right">£${totalPrice}</td>
        </tr>
      `;
    })
    .join("");

  const orderNum = orderInfo?.orderNumber
    ? String(orderInfo.orderNumber).padStart(2, "0")
    : orderId.slice(0, 8).toUpperCase();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Invoice – Order #${orderNum}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Poppins', sans-serif;
          color: #1a1a1a;
          background: #fff;
          padding: 40px 48px;
          font-size: 13px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 36px;
          padding-bottom: 24px;
          border-bottom: 2px solid #000;
        }
        .brand-name {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #000;
        }
        .brand-tagline {
          font-size: 11px;
          color: #666;
          margin-top: 3px;
        }
        .invoice-meta {
          text-align: right;
        }
        .invoice-meta h2 {
          font-size: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #000;
        }
        .invoice-meta p {
          font-size: 12px;
          color: #555;
          margin-top: 4px;
        }
        .invoice-meta .order-num {
          font-size: 14px;
          font-weight: 600;
          color: #000;
          margin-top: 6px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        .info-block h4 {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #888;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .info-block p {
          font-size: 13px;
          color: #222;
          line-height: 1.6;
        }
        .info-block p.name {
          font-weight: 700;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0;
        }
        thead tr {
          background: #000;
          color: #fff;
        }
        thead th {
          padding: 10px 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          text-align: left;
        }
        thead th:nth-child(2),
        thead th:nth-child(3) {
          text-align: center;
        }
        thead th:nth-child(4),
        thead th:nth-child(5) {
          text-align: right;
        }
        tbody tr {
          border-bottom: 1px solid #eee;
        }
        tbody tr:nth-child(even) {
          background: #f9f9f9;
        }
        tbody td {
          padding: 10px 12px;
          font-size: 13px;
          color: #333;
          vertical-align: top;
        }
        .totals-section {
          border-top: 2px solid #000;
          margin-top: 0;
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          gap: 48px;
          font-size: 14px;
        }
        .total-row.grand {
          font-weight: 800;
          font-size: 16px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          margin-top: 4px;
        }
        .total-row span:first-child {
          color: #555;
        }
        .total-row.grand span:first-child {
          color: #000;
        }
        .footer {
          margin-top: 48px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer p {
          font-size: 11px;
          color: #888;
        }
        .thank-you {
          font-size: 13px;
          font-weight: 600;
          color: #000;
        }
        @media print {
          body { padding: 20px 30px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand-name">Laundry Free</div>
          <div class="brand-tagline">Professional Laundry &amp; Dry Cleaning Service</div>
        </div>
        <div class="invoice-meta">
          <h2>Invoice</h2>
          <p class="order-num">Order #${orderNum}</p>
          <p>Date Issued: ${formatDate(orderInfo?.createdAt || new Date().toISOString())}</p>
          ${orderInfo?.pickupDate ? `<p>Pickup: ${formatDate(orderInfo.pickupDate)}</p>` : ""}
          ${orderInfo?.dropoffDate ? `<p>Dropoff: ${formatDate(orderInfo.dropoffDate)}</p>` : ""}
        </div>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <h4>Billed To</h4>
          <p class="name">${orderInfo?.customerName || "—"}</p>
          <p>${orderInfo?.customerEmail || ""}</p>
          <p>${orderInfo?.customerPhone || ""}</p>
          <p>${orderInfo?.customerAddress || ""}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Qty</th>
            <th>Service</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="total-row grand">
          <span>Total Amount</span>
          <span>£${totalRevenue}</span>
        </div>
      </div>

      <div class="footer">
        <div>
          <p class="thank-you">Thank you for choosing Laundry Free!</p>
          <p style="margin-top:4px">For queries: support@laundryfree.co.uk</p>
        </div>
        <p>This is a computer-generated invoice.</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
};
