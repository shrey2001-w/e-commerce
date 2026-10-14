// Sends transactional emails through the Brevo (Sendinblue) REST API.
// No extra npm package needed — it uses the built-in fetch.

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

type NewUser = {
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
};

/* ---------- helpers ---------- */

// Escape user-supplied text so nobody can inject HTML into the emails
function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(d: Date) {
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#6b7280;font-size:14px;width:140px;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#111827;font-size:15px;font-weight:600;">${value}</td>
    </tr>`;
}

// Shared layout used by all emails (inline CSS + tables for email-client support)
function layout(title: string, intro: string, rowsHtml: string, footer: string) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#1a1b2e;border-top:4px solid #DC2626;padding:22px 28px;">
                <span style="font-size:26px;font-weight:800;letter-spacing:1px;color:#DC2626;">CITYMALL</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 12px;font-size:22px;color:#1a1b2e;">${title}</h1>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">${intro}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">${footer}</p>
              </td>
            </tr>
            <tr>
              <td style="background:#1a1b2e;padding:16px 28px;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} CityMall. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/* ---------- templates ---------- */

function userEmailHtml(u: NewUser) {
  const rows =
    detailRow("Name", esc(u.name)) +
    detailRow("Email", esc(u.email)) +
    detailRow("Phone", esc(u.phone)) +
    detailRow("Joined on", esc(formatDate(u.createdAt)));

  return layout(
    `Welcome to CityMall, ${esc(u.name)}!`,
    "Your account has been created successfully. Here are the details you registered with:",
    rows,
    "If you didn't create this account, please reply to this email and we'll look into it."
  );
}

function adminEmailHtml(u: NewUser) {
  const rows =
    detailRow("Name", esc(u.name)) +
    detailRow("Email", esc(u.email)) +
    detailRow("Phone", esc(u.phone)) +
    detailRow("Signed up on", esc(formatDate(u.createdAt)));

  return layout(
    "New user signed up",
    "A new customer just created an account on CityMall:",
    rows,
    "You can reply to this email to contact the customer directly."
  );
}

function resetEmailHtml(name: string, resetUrl: string) {
  const safeUrl = esc(resetUrl);
  const rows = `
    <tr>
      <td style="padding:8px 0 4px;">
        <a href="${safeUrl}"
           style="display:inline-block;background:#DC2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:8px;">
          Reset Password
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding-top:18px;font-size:13px;line-height:1.6;color:#6b7280;">
        Button not working? Copy and paste this link into your browser:<br />
        <a href="${safeUrl}" style="color:#DC2626;word-break:break-all;">${safeUrl}</a>
      </td>
    </tr>`;

  return layout(
    `Hi ${esc(name)}, reset your password`,
    "We received a request to reset the password for your CityMall account. This link is valid for <strong>1 hour</strong>.",
    rows,
    "If you didn't ask for this, you can safely ignore this email. Your password will not change."
  );
}

/* ---------- sending ---------- */

async function sendBrevoEmail(payload: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
}) {
  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY as string,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "CityMall",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      ...payload,
    }),
  });

  if (!res.ok) {
    throw new Error(`Brevo ${res.status}: ${await res.text()}`);
  }
}

// Sends the welcome email to the user AND a notification to the admin.
// Never throws — a failed email must not break account creation.
export async function sendSignupEmails(user: NewUser) {
  const { BREVO_API_KEY, BREVO_SENDER_EMAIL, ADMIN_EMAIL } = process.env;

  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    console.error("Email skipped: BREVO_API_KEY or BREVO_SENDER_EMAIL is missing in .env");
    return;
  }

  const jobs: Promise<void>[] = [
    sendBrevoEmail({
      to: [{ email: user.email, name: user.name }],
      subject: "Welcome to CityMall – your account is ready",
      htmlContent: userEmailHtml(user),
    }),
  ];

  if (ADMIN_EMAIL) {
    jobs.push(
      sendBrevoEmail({
        to: [{ email: ADMIN_EMAIL }],
        subject: `New signup: ${user.name}`,
        htmlContent: adminEmailHtml(user),
        replyTo: { email: user.email, name: user.name },
      })
    );
  } else {
    console.error("Admin email skipped: ADMIN_EMAIL is missing in .env");
  }

  const results = await Promise.allSettled(jobs);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Signup email failed:", r.reason);
  });
}

// Sends the "reset your password" email containing the one-time link.
// Throws on failure so the caller can log it.
export async function sendPasswordResetEmail(
  user: { name: string; email: string },
  resetUrl: string
) {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    throw new Error("BREVO_API_KEY or BREVO_SENDER_EMAIL is missing in .env");
  }

  await sendBrevoEmail({
    to: [{ email: user.email, name: user.name }],
    subject: "Reset your CityMall password",
    htmlContent: resetEmailHtml(user.name, resetUrl),
  });
}

/* ---------- order emails ---------- */

export type OrderMail = {
  id: string;
  total: number;
  paymentMethod: "cod" | "upi" | "stripe";
  paymentDetail?: string; // e.g. "Visa card ending 4242"
  transactionId?: string; // Stripe payment ID
  items: { name: string; price: number; qty: number }[];
  address?: { line?: string; city?: string; pincode?: string };
  createdAt: Date;
};

const METHOD_LABEL: Record<OrderMail["paymentMethod"], string> = {
  cod: "Cash on Delivery",
  upi: "UPI (payment to be verified)",
  stripe: "Online payment via Stripe",
};

const STATUS_LABEL: Record<OrderMail["paymentMethod"], string> = {
  cod: "To be paid on delivery",
  upi: "Awaiting verification",
  stripe: "Paid",
};

const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function orderRows(o: OrderMail, u: { name: string; email: string; phone: string }) {
  const itemsHtml = o.items
    .map((i) => `${esc(i.name)} × ${i.qty} — ${inr(i.price * i.qty)}`)
    .join("<br />");
  const address = o.address?.line
    ? `${o.address.line}, ${o.address.city ?? ""} ${o.address.pincode ?? ""}`
    : "Not provided";
  const payment = o.paymentDetail
    ? `${METHOD_LABEL[o.paymentMethod]} (${o.paymentDetail})`
    : METHOD_LABEL[o.paymentMethod];

  return (
    detailRow("Order ID", esc(o.id)) +
    detailRow("Customer", esc(u.name)) +
    detailRow("Phone", esc(u.phone)) +
    detailRow("Email", esc(u.email)) +
    detailRow("Address", esc(address)) +
    detailRow("Items", itemsHtml) +
    detailRow("Payment method", esc(payment)) +
    detailRow("Payment status", esc(STATUS_LABEL[o.paymentMethod])) +
    (o.transactionId ? detailRow("Transaction ID", esc(o.transactionId)) : "") +
    detailRow("Total", esc(inr(o.total))) +
    detailRow("Placed on", esc(formatDate(o.createdAt)))
  );
}

// Sends the order confirmation to the customer AND the order details to the admin.
// Never throws, so a failed email can't break the order.
export async function sendOrderEmails(
  order: OrderMail,
  user: { name: string; email: string; phone: string }
) {
  const { BREVO_API_KEY, BREVO_SENDER_EMAIL, ADMIN_EMAIL } = process.env;
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    console.error("Order email skipped: BREVO_API_KEY or BREVO_SENDER_EMAIL is missing");
    return;
  }

  const rows = orderRows(order, user);
  const jobs: Promise<void>[] = [
    sendBrevoEmail({
      to: [{ email: user.email, name: user.name }],
      subject: `Your CityMall order is confirmed (${order.id})`,
      htmlContent: layout(
        `Thanks for your order, ${esc(user.name)}!`,
        order.paymentMethod === "stripe"
          ? "Your payment was successful and your order is confirmed. Here are the details:"
          : "We have received your order. Here are the details:",
        rows,
        "If you have any questions, just reply to this email."
      ),
    }),
  ];

  if (ADMIN_EMAIL) {
    jobs.push(
      sendBrevoEmail({
        to: [{ email: ADMIN_EMAIL }],
        subject: `New order ${inr(order.total)} — ${METHOD_LABEL[order.paymentMethod]}`,
        htmlContent: layout(
          "New order received",
          "A customer just placed an order on CityMall:",
          rows,
          "Reply to this email to contact the customer directly."
        ),
        replyTo: { email: user.email, name: user.name },
      })
    );
  }

  const results = await Promise.allSettled(jobs);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Order email failed:", r.reason);
  });
}