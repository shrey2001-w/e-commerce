export type InfoSection = { heading?: string; body: string[] };
export type InfoPageData = { slug: string; title: string; intro: string; sections: InfoSection[] };

const EMAIL = "support@citymall.live";

type Content = Omit<InfoPageData, "slug" | "title">;

/** keyed by slugified link label, e.g. "About Us" -> "about-us" */
const content: Record<string, Content> = {
  "about-us": {
    intro: "CityMall helps families shop everyday needs and more at low prices, with cash on delivery and free delivery.",
    sections: [
      { heading: "Who we are", body: ["We bring groceries, home, beauty, fashion, electronics and more to your doorstep at honest prices."] },
      { heading: "Why shop with us", body: ["Low prices on trusted brands.", "Cash on delivery and free delivery.", "Fast, reliable service and friendly support."] },
    ],
  },
  "contact-us": {
    intro: "We're happy to help with orders, payments or anything else.",
    sections: [
      { heading: "Email", body: [EMAIL] },
      { heading: "Registered Address", body: ["Rashanbox Retail Private Limited", "CIN: U52190HR2020PTC086114", "Unit No. 1103 Plus Office, 1st Floor, Landmark Cyber Park, Sector 67, Badshahpur, Gurgaon, Haryana, India, 122101"] },
      { heading: "Corporate Office", body: ["12th Floor, Imperia MindSpace Golf Course Ext Rd, Sector 62, Gurgaon, Haryana 122001"] },
    ],
  },
  careers: {
    intro: "Join us and help build a better way to shop.",
    sections: [
      { heading: "Open roles", body: ["We don't have openings listed right now."] },
      { heading: "Send your resume", body: [`Email your resume to ${EMAIL} with the role you're interested in.`] },
    ],
  },
  blog: {
    intro: "Shopping tips, deals and updates from CityMall.",
    sections: [{ body: ["New posts are coming soon."] }],
  },
  "privacy-policy": {
    intro: "How we collect, use and protect your information.",
    sections: [
      { heading: "Information we collect", body: ["Name, phone number, email, delivery address and order details you give us when you sign up or place an order."] },
      { heading: "How we use it", body: ["To process orders, deliver products, provide support and improve our service."] },
      { heading: "Sharing", body: ["We share data only with delivery and payment partners needed to complete your order, or when required by law. We do not sell your personal data."] },
      { heading: "Your choices", body: [`You can ask us to update or delete your data by emailing ${EMAIL}.`] },
    ],
  },
  "terms-conditions": {
    intro: "Please read these terms before using CityMall.",
    sections: [
      { heading: "Using the platform", body: ["You must provide accurate information and keep your account secure."] },
      { heading: "Pricing and orders", body: ["Prices, offers and availability can change. We may cancel orders affected by pricing or stock errors and refund any payment."] },
      { heading: "Liability", body: ["We are not liable for delays or losses caused by events outside our control."] },
    ],
  },
  "return-refund-policy": {
    intro: "Items marked non-returnable cannot be returned. Check your order at delivery.",
    sections: [
      { heading: "Damaged or wrong items", body: ["Report damaged, missing or wrong items at delivery or within 24 hours, with photos."] },
      { heading: "Refunds", body: ["Approved refunds go to your original payment method, or as store credit for cash on delivery orders, after verification."] },
    ],
  },
  "shipping-policy": {
    intro: "Free delivery with cash on delivery available.",
    sections: [
      { heading: "Delivery time", body: ["The estimated delivery date is shown on each product page."] },
      { heading: "Delivery charges", body: ["Delivery is free on eligible orders."] },
    ],
  },
  "grievance-redressal": {
    intro: "If you have a complaint, we will resolve it promptly.",
    sections: [
      { heading: "How to complain", body: [`Email ${EMAIL} with your order ID and details of the issue.`] },
      { heading: "Resolution time", body: ["We acknowledge complaints within 48 hours and aim to resolve them within 15 days."] },
    ],
  },
};

/** used for any footer link that has no entry above */
const generic = (title: string): Content => ({
  intro: `Information about ${title}.`,
  sections: [{ body: [`This page is coming soon. For help, email ${EMAIL}.`] }],
});

export function buildInfoPage(slug: string, label: string, key: string): InfoPageData {
  return { slug, title: label, ...(content[key] ?? generic(label)) };
}