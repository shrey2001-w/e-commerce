export type FooterLink = { label: string; href: string };

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const companyLinks: FooterLink[] = [
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
];

export const legalLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Return & Refund Policy", href: "/return-refund-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Grievance Redressal", href: "/grievance-redressal" },
];

export const businessLinks: FooterLink[] = [
  { label: "Sell on CityMall", href: "/sell-on-citymall" },
  { label: "Become a Partner", href: "/become-a-partner" },
];

export const cities: string[] = [
  "Jaipur", "Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune",
  "Ahmedabad", "Lucknow", "Gurgaon", "Noida", "Chandigarh", "Indore", "Bhopal", "Patna",
  "Nagpur", "Surat", "Kanpur", "Agra", "Jodhpur", "Udaipur", "Kota", "Ajmer",
];

/**
 * Titles match the category names in data/products.ts, so each slug
 * (e.g. "women-fashion") maps straight to that product category.
 * Sub-category words are matched against product names.
 */
export const footerCategories: { title: string; links: string[] }[] = [
  { title: "Staples", links: ["Atta & Rice", "Dal & Pulses", "Edible Oil", "Besan"] },
  { title: "Brand Food & Beverages", links: ["Noodles", "Biscuits", "Coffee", "Soft Drinks", "Detergent", "Sauces & Ketchup"] },
  { title: "Fruits & Vegetables", links: ["Onion & Potato", "Tomato", "Apples & Bananas", "Herbs & Coriander"] },
  { title: "Home & Personal Care", links: ["Soaps", "Toothpaste", "Shampoo", "Cleaners", "Dishwash"] },
  { title: "Beauty & Cosmetics", links: ["Lipstick", "Kajal", "Face Serum", "Sunscreen", "Nail Polish", "Compact Powder"] },
  { title: "Health & Wellness", links: ["Immunity", "Protein", "Thermometer", "Multivitamin", "Glucometer", "Green Tea"] },
  { title: "Home & Kitchen", links: ["Tawa", "Water Bottle", "Pressure Cooker", "Bedsheets", "Containers", "Cleaning Cloth"] },
  { title: "Electronics", links: ["Earbuds", "Neckband", "Power Bank", "Chargers", "Smart Bulb", "Mouse", "Watches"] },
  { title: "Women Fashion", links: ["Sarees", "Gloves"] },
  { title: "Men Fashion", links: ["T-Shirts", "Jeans", "Shoes", "Wallet", "Socks"] },
  { title: "Kids & Toys", links: ["Kids Shoes", "Toy Cars", "Building Blocks", "Teddy Bear", "Diapers", "School Bags"] },
  { title: "Books & Stationery", links: ["Notebooks", "Pens", "Paperbacks", "Geometry Box", "Copier Paper"] },
];