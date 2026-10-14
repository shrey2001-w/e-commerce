export type FooterLink = { label: string; href: string };

export type FooterCategory = {
  title: string;
  links: string[]; // sub-category names
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const companyLinks: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Become a Seller", href: "/become-a-seller" },
  { label: "Become a Partner", href: "/become-a-partner" },
  { label: "Delete Account", href: "/delete-account" },
  { label: "Customer Care", href: "/customer-care" },
];

export const legalLinks: FooterLink[] = [
  { label: "Return Policy", href: "/return-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Suppliers", href: "/suppliers" },
  { label: "FAQ", href: "/faq" },
  { label: "T&C", href: "/terms-and-conditions" },
];

export const businessLinks: FooterLink[] = [
  { label: "ShipPrime", href: "#" },
  { label: "DropshipIndia", href: "#" },
];

export const cities: string[] = [
  "Delhi", "Lucknow", "Kanpur", "Ghaziabad", "Noida", "Gurgaon", "Varanasi",
  "Faridabad", "Prayagraj", "Patna", "Agra", "Gorakhpur", "Dehradun", "Aligarh", "Haridwar",
];

export const footerCategories: FooterCategory[] = [
  {
    title: "Staples",
    links: [
      "Edible Oils", "Salt, Sugar & Jaggery", "Pulses", "Whole Spices",
      "Besan, Sooji & Similar Products", "Powder Spices & Pastes", "Dry Fruits & Nuts",
      "Ready Masale", "Rice And Rice Products", "Atta", "Ghee & Vanaspati",
    ],
  },
  {
    title: "Branded Food & Beverages",
    links: [
      "Biscuits, Cookies & Cakes", "Tea & Coffee", "Ready to Cook & Eat", "Namkeen & Mixtures",
      "Sauces & Ketchups", "Aerated Drinks", "Juices", "Chips & Puffs", "Chocolate & Candies",
      "Jam, Honey & Spreads", "Sweets", "Pickles & Chutneys", "Dessert & Cake Mixes",
      "Breakfast Items", "Popcorns", "Health Drink & Dairy Beverage", "Syrup and Concentrates",
      "Dairy Products", "Health Foods", "Baby Food", "Butter & Cheese", "Water & Powdered Mixes",
      "Eggs & Bread", "Milk & Curd", "Paneer", "Dips & Spreads",
    ],
  },
  { title: "Fruits & Vegetables", links: ["Fruits & Vegetables"] },
  {
    title: "Home & Personal Care",
    links: [
      "Home Care", "Bath and Handwash", "Oral Care Products", "Hair Care", "Face & Skincare",
      "Baby Care Products", "Female Hygiene", "Deo, Perfumes & Talc", "Mens Grooming",
      "Bath Accessories", "Shoe Care", "Eye Care",
    ],
  },
  {
    title: "Beauty & Cosmetics",
    links: ["Makeup", "Lips", "Eyes", "Nails", "Face Makeup", "Skincare Combos", "Fragrances", "Beauty Tools"],
  },
  {
    title: "Health & Wellness",
    links: ["Vitamins & Supplements", "Protein & Nutrition", "Ayurvedic Care", "Health Devices", "Sexual Wellness", "First Aid"],
  },
  {
    title: "Home & Kitchen",
    links: ["Cookware", "Kitchen Tools", "Storage & Containers", "Bedsheets & Bedding", "Home Decor", "Cleaning Supplies", "Dinnerware", "Bathroom Essentials"],
  },
  {
    title: "Electronics",
    links: ["Mobile Accessories", "Headphones & Earphones", "Smart Watches", "Chargers & Cables", "Power Banks", "Computer Accessories", "Home Appliances", "Lighting"],
  },
  {
    title: "Women Fashion",
    links: ["Sarees", "Kurtis & Kurta Sets", "Dresses", "Lehengas", "Ethnic Wear", "Western Wear", "Lingerie", "Footwear", "Bags & Purses", "Jewellery"],
  },
  {
    title: "Men Fashion",
    links: ["T-Shirts", "Shirts", "Jeans & Trousers", "Ethnic Wear", "Innerwear", "Footwear", "Watches", "Wallets & Belts"],
  },
  {
    title: "Kids & Toys",
    links: ["Toys & Games", "Kids Clothing", "Kids Footwear", "School Bags", "Baby Essentials", "Remote Control Toys", "Soft Toys"],
  },
  {
    title: "Books & Stationery",
    links: ["Notebooks", "Pens & Pencils", "Art & Craft", "Office Supplies", "Study Material", "Story Books"],
  },
];