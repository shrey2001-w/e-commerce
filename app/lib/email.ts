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

// Shared layout used by both emails (inline CSS + tables for email-client support)
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
    console.error("Email skipped: BREVO_API_KEY or BREVO_SENDER_EMAIL is missing in .env.local");
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
    console.error("Admin email skipped: ADMIN_EMAIL is missing in .env.local");
  }

  const results = await Promise.allSettled(jobs);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Signup email failed:", r.reason);
  });
}