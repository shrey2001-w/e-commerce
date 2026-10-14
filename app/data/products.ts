export type Product = {
  id: string;
  name: string;
  brand?: string;
  /** path inside /public, e.g. /products/rajdhani-besan-1kg.jpg */
  image: string;
  price: number;
  mrp: number;
  /** e.g. "1 kg", "500 g", "1 Pcs", "Free Size", "7 C" */
  quantity: string;
  /** optional per-unit price label, e.g. "₹107/kg" */
  unitPrice?: string;
  rating: number;
  ratingCount: string;
  /** number of variants – shows the "2 options" button like the reference UI */
  options?: number;
  /** show badge as "₹377 OFF" instead of "37% OFF" */
  badgeInRupees?: boolean;

  /* ---- product detail page (all optional) ---- */
  /** gallery images shown on the detail page (falls back to `image`) */
  images?: string[];
  /** one line per entry; emojis are fine */
  description?: string[];
  /** pack selector, e.g. Pack of 1 / Pack of 2 – each pack has its own price */
  packs?: { label: string; price: number; mrp: number }[];
  /** extra breadcrumb levels between Home and the product name */
  breadcrumb?: string[];
  /** show the red "Express" delivery line (default: true) */
  express?: boolean;
  /** default: true */
  nonReturnable?: boolean;
  /** cash on delivery (default: true) */
  cod?: boolean;
};

export type Category = {
  id: string;
  name: string;
  emoji: string; // used as image fallback + tab icon
  products: Product[];
};

type P = Omit<Product, "id" | "image"> & { id?: string; image?: string };

const make = (cat: string, items: P[]): Product[] =>
  items.map((p, i) => {
    const id = p.id ?? `${cat}-${i + 1}`;
    return { ...p, id, image: p.image ?? `/products/${id}.jpg` };
  });

export const categories: Category[] = [
  {
    id: "staples",
    name: "Staples",
    emoji: "🌾",
    products: make("staples", [
      { name: "Rajdhani Besan 1 Kg", brand: "Rajdhani", price: 107, mrp: 169, quantity: "1 kg", unitPrice: "₹107/kg", rating: 4.3, ratingCount: "25", options: 2 },
      { name: "Chana Kabuli 1 Kg - Loose", brand: "Loose", price: 104, mrp: 120, quantity: "1 kg", unitPrice: "₹104/kg", rating: 4.3, ratingCount: "25", options: 2 },
      { name: "Rajdhani Besan 500 g", brand: "Rajdhani", price: 56, mrp: 85, quantity: "500 g", unitPrice: "₹112/kg", rating: 4.3, ratingCount: "23", options: 2 },
      { name: "Toor Dal Premium 1 Kg", brand: "Tata Sampann", price: 168, mrp: 195, quantity: "1 kg", unitPrice: "₹168/kg", rating: 4.4, ratingCount: "312" },
      { name: "Sona Masoori Rice 5 Kg", brand: "India Gate", price: 349, mrp: 425, quantity: "5 kg", unitPrice: "₹70/kg", rating: 4.2, ratingCount: "1.2k", options: 3 },
      { name: "Aashirvaad Atta 5 Kg", brand: "Aashirvaad", price: 245, mrp: 289, quantity: "5 kg", unitPrice: "₹49/kg", rating: 4.5, ratingCount: "5.4k", options: 2 },
      { name: "Fortune Soya Oil 1 L", brand: "Fortune", price: 129, mrp: 155, quantity: "1 L", unitPrice: "₹129/L", rating: 4.3, ratingCount: "890" },
    ]),
  },
  {
    id: "brand-food-beverages",
    name: "Brand Food & Beverages",
    emoji: "🥤",
    products: make("brand-food-beverages", [
      { name: "Surf Excel Easy Wash Blue Detergent 1 kg", brand: "Surf Excel", price: 141, mrp: 147, quantity: "1 kg", unitPrice: "₹141/kg", rating: 4.3, ratingCount: "22", options: 3 },
      { name: "Maggi 2-Minute Noodles Pack of 12", brand: "Maggi", price: 168, mrp: 180, quantity: "Pack Of 12", rating: 4.5, ratingCount: "2.1k" },
      { name: "Coca-Cola Soft Drink 2.25 L", brand: "Coca-Cola", price: 95, mrp: 100, quantity: "2.25 L", rating: 4.4, ratingCount: "640" },
      { name: "Parle-G Gold Biscuits 1 kg", brand: "Parle", price: 98, mrp: 110, quantity: "1 kg", unitPrice: "₹98/kg", rating: 4.6, ratingCount: "3.3k", options: 2 },
      { name: "Nescafe Classic Coffee 200 g", brand: "Nescafe", price: 549, mrp: 640, quantity: "200 g", rating: 4.5, ratingCount: "1.1k" },
      { name: "Kissan Fresh Tomato Ketchup 950 g", brand: "Kissan", price: 139, mrp: 165, quantity: "950 g", rating: 4.4, ratingCount: "480" },
    ]),
  },
  {
    id: "fruits-vegetables",
    name: "Fruits & Vegetables",
    emoji: "🥦",
    products: make("fruits-vegetables", [
      { name: "Fresh Onion 1 Kg", brand: "Loose", price: 32, mrp: 40, quantity: "1 kg", unitPrice: "₹32/kg", rating: 4.1, ratingCount: "210" },
      { name: "Potato (Aloo) 1 Kg", brand: "Loose", price: 28, mrp: 35, quantity: "1 kg", unitPrice: "₹28/kg", rating: 4.2, ratingCount: "340" },
      { name: "Tomato Hybrid 500 g", brand: "Loose", price: 22, mrp: 30, quantity: "500 g", unitPrice: "₹44/kg", rating: 4.0, ratingCount: "180" },
      { name: "Shimla Apple 4 Pcs", brand: "Fresh", price: 129, mrp: 160, quantity: "4 Pcs", rating: 4.3, ratingCount: "95", options: 2 },
      { name: "Banana Robusta 6 Pcs", brand: "Fresh", price: 42, mrp: 50, quantity: "6 Pcs", rating: 4.2, ratingCount: "260" },
      { name: "Fresh Coriander 100 g", brand: "Fresh", price: 12, mrp: 15, quantity: "100 g", rating: 4.0, ratingCount: "75" },
    ]),
  },
  {
    id: "home-personal-care",
    name: "Home & Personal Care",
    emoji: "🧴",
    products: make("home-personal-care", [
      { name: "Dettol Original Soap Pack of 4", brand: "Dettol", price: 156, mrp: 192, quantity: "Pack Of 4", rating: 4.5, ratingCount: "1.8k", options: 2 },
      { name: "Colgate Strong Teeth Toothpaste 500 g", brand: "Colgate", price: 215, mrp: 255, quantity: "500 g", rating: 4.4, ratingCount: "920" },
      { name: "Head & Shoulders Shampoo 650 ml", brand: "Head & Shoulders", price: 449, mrp: 620, quantity: "650 ml", rating: 4.3, ratingCount: "560", options: 2 },
      { name: "Harpic Toilet Cleaner 1 L", brand: "Harpic", price: 169, mrp: 195, quantity: "1 L", rating: 4.5, ratingCount: "2.4k" },
      { name: "Vim Dishwash Gel 750 ml", brand: "Vim", price: 135, mrp: 160, quantity: "750 ml", rating: 4.4, ratingCount: "730" },
      { name: "Lizol Floor Cleaner 975 ml", brand: "Lizol", price: 175, mrp: 215, quantity: "975 ml", rating: 4.4, ratingCount: "640", options: 3 },
    ]),
  },
  {
    id: "beauty-cosmetics",
    name: "Beauty & Cosmetics",
    emoji: "💄",
    products: make("beauty-cosmetics", [
      { name: "Matte Liquid Lipstick, Ruby Red", brand: "Sugar", price: 349, mrp: 699, quantity: "1 Pcs", rating: 4.2, ratingCount: "1.4k", options: 4, badgeInRupees: true },
      { name: "Kajal Smudge-proof Black", brand: "Lakme", price: 169, mrp: 225, quantity: "0.35 g", rating: 4.4, ratingCount: "3.2k" },
      { name: "Vitamin C Face Serum 30 ml", brand: "Minimalist", price: 539, mrp: 699, quantity: "30 ml", rating: 4.5, ratingCount: "5.6k" },
      { name: "Sunscreen SPF 50 PA+++ 50 g", brand: "Neutrogena", price: 499, mrp: 650, quantity: "50 g", rating: 4.3, ratingCount: "980" },
      { name: "Nail Polish Combo Pack of 6", brand: "Maybelline", price: 299, mrp: 599, quantity: "Pack Of 6", rating: 3.9, ratingCount: "410", options: 2, badgeInRupees: true },
      { name: "Compact Powder Natural Beige", brand: "Lakme", price: 225, mrp: 295, quantity: "9 g", rating: 4.2, ratingCount: "770", options: 3 },
    ]),
  },
  {
    id: "health-wellness",
    name: "Health & Wellness",
    emoji: "💊",
    products: make("health-wellness", [
      { name: "Chyawanprash Immunity Booster 1 kg", brand: "Dabur", price: 389, mrp: 450, quantity: "1 kg", rating: 4.5, ratingCount: "2.9k" },
      { name: "Whey Protein Chocolate 1 kg", brand: "MuscleBlaze", price: 1799, mrp: 2599, quantity: "1 kg", rating: 4.3, ratingCount: "1.6k", options: 3, badgeInRupees: true },
      { name: "Digital Thermometer", brand: "Dr Morepen", price: 149, mrp: 299, quantity: "1 Pcs", rating: 4.1, ratingCount: "860" },
      { name: "Multivitamin Tablets (60 count)", brand: "HealthKart", price: 449, mrp: 699, quantity: "60 Tabs", rating: 4.2, ratingCount: "1.3k" },
      { name: "Glucometer with 25 Strips", brand: "Accu-Chek", price: 899, mrp: 1250, quantity: "1 Set", rating: 4.4, ratingCount: "540" },
      { name: "Herbal Green Tea 100 Bags", brand: "Tetley", price: 249, mrp: 310, quantity: "100 Bags", rating: 4.3, ratingCount: "1.1k" },
    ]),
  },
  {
    id: "home-kitchen",
    name: "Home & Kitchen",
    emoji: "🍳",
    products: make("home-kitchen", [
      { name: "Non-Stick Tawa 28 cm", brand: "Prestige", price: 449, mrp: 799, quantity: "1 Pcs", rating: 4.3, ratingCount: "2.2k", options: 2, badgeInRupees: true },
      { name: "Stainless Steel Water Bottle 1 L", brand: "Milton", price: 299, mrp: 499, quantity: "1 L", rating: 4.4, ratingCount: "3.5k", options: 4 },
      { name: "Pressure Cooker 5 L", brand: "Hawkins", price: 1499, mrp: 1950, quantity: "5 L", rating: 4.6, ratingCount: "4.8k", badgeInRupees: true },
      { name: "Bedsheet Double Cotton with 2 Pillow Covers", brand: "Home Centre", price: 399, mrp: 999, quantity: "1 Pcs", rating: 3.9, ratingCount: "1.2k", options: 6, badgeInRupees: true },
      { name: "Airtight Container Set of 6", brand: "Cello", price: 349, mrp: 599, quantity: "Pack Of 6", rating: 4.2, ratingCount: "980" },
      { name: "Microfiber Cleaning Cloth Pack of 10", brand: "Scotch-Brite", price: 199, mrp: 349, quantity: "Pack Of 10", rating: 4.3, ratingCount: "1.5k" },
    ]),
  },
  {
    id: "electronics",
    name: "Electronics",
    emoji: "🎧",
    products: make("electronics", [
      { name: "Digital Watch Combo for Kids, Pack of 2, Multicolour", brand: "TECHEL", price: 129, mrp: 599, quantity: "Pack Of 2", rating: 3.4, ratingCount: "3.0k" },
      { name: "Bluetooth Neckband with 30 hr Playtime", brand: "boAt", price: 799, mrp: 1999, quantity: "1 Pcs", rating: 4.1, ratingCount: "12k", options: 5, badgeInRupees: true },
      { name: "20000 mAh Power Bank 22.5W", brand: "Mi", price: 1599, mrp: 2499, quantity: "1 Pcs", rating: 4.3, ratingCount: "6.7k", options: 2, badgeInRupees: true },
      { name: "Fast Charger 33W with Type-C Cable", brand: "Ambrane", price: 449, mrp: 999, quantity: "1 Pcs", rating: 4.0, ratingCount: "2.3k" },
      { name: "LED Smart Bulb 9W RGB", brand: "Wipro", price: 499, mrp: 899, quantity: "1 Pcs", rating: 4.2, ratingCount: "1.8k" },
      { name: "Wireless Mouse 2.4 GHz", brand: "Logitech", price: 549, mrp: 895, quantity: "1 Pcs", rating: 4.4, ratingCount: "9.1k", options: 3 },
      {
        id: "tecsox-tecpod-max-30h-white",
        name: "TecSox Tecpod Max Wireless Earbuds - 30H White",
        brand: "TecSox",
        image: "/products/tecsox-tecpod-max-1.jpg",
        images: [1, 2, 3, 4, 5, 6, 7].map((n) => `/products/tecsox-tecpod-max-${n}.jpg`),
        price: 269,
        mrp: 2999,
        quantity: "Pack of 1",
        rating: 3.5,
        ratingCount: "386",
        options: 2,
        packs: [
          { label: "Pack of 2", price: 499, mrp: 5998 },
          { label: "Pack of 1", price: 269, mrp: 2999 },
        ],
        breadcrumb: ["Audio & Video", "Headphones & Earphones", "Bluetooth Headphones & Earphones"],
        description: [
          "TecSox Tecpod | Max White Bluetooth Earbuds With 10 mm Deep Bass Driver & Comfortable Fit | IPX 4 Water Resistant | 30-Hour Playtime .",
          "Specification:-",
          "🔵 Bluetooth Version: Bluetooth 5.3",
          "🔋 Battery Type: Li-Po Battery",
          "🔋 Battery Capacity: 180mAh",
          "🔌 Charging Type: Type-C Charging",
          "📶 Working Distance: Up to 12 Meters",
          "⏳ Playtime: 30 Hours Battery Life",
          "🎵 Sound: Deep Bass with 10mm Drivers",
          "💧 Water Resistance: IPX4 Splash-Proof",
          "🎚️ Frequency Range: 20Hz – 20KHz",
          "🎙️ Voice Assistant: One-Touch Activation",
          "🔰 Brand Warranty: 6 Months Warranty",
        ],
        express: true,
        nonReturnable: true,
        cod: true,
      },
    ]),
  },
  {
    id: "women-fashion",
    name: "Women Fashion",
    emoji: "👗",
    products: make("women-fashion", [
      { name: "Poly Georgette Solid Saree For Women, Purple", price: 422, mrp: 799, quantity: "1 Pcs", rating: 3.8, ratingCount: "112", badgeInRupees: true },
      { name: "Chiffon Solid Saree For Women, Brown", price: 422, mrp: 799, quantity: "1 Pcs", rating: 4.0, ratingCount: "139", badgeInRupees: true },
      { name: "Chiffon Printed Saree for Women (Black, 6.1 m)", price: 349, mrp: 699, quantity: "Black", rating: 4.0, ratingCount: "207", badgeInRupees: true },
      { name: "Jimmy Choo Solid Saree For Women, Teal", price: 517, mrp: 799, quantity: "1 Pcs", rating: 2.7, ratingCount: "9", badgeInRupees: true },
      { name: "Nylon Gloves for Women, Black", price: 125, mrp: 146, quantity: "Free Size", rating: 0, ratingCount: "0", badgeInRupees: true },
      { name: "Chiffon Solid Saree For Women, Purple", price: 517, mrp: 799, quantity: "1 Pcs", rating: 4.0, ratingCount: "97", badgeInRupees: true },
    ]),
  },
  {
    id: "men-fashion",
    name: "Men Fashion",
    emoji: "👔",
    products: make("men-fashion", [
      { name: "Cotton Round Neck T-Shirt, Navy", brand: "Roadster", price: 299, mrp: 799, quantity: "L", rating: 4.1, ratingCount: "2.6k", options: 5, badgeInRupees: true },
      { name: "Slim Fit Jeans, Dark Blue", brand: "Levis", price: 1199, mrp: 2499, quantity: "32", rating: 4.2, ratingCount: "1.9k", options: 6, badgeInRupees: true },
      { name: "Formal Shirt Full Sleeve, White", brand: "Peter England", price: 649, mrp: 1499, quantity: "40", rating: 4.0, ratingCount: "860", options: 4, badgeInRupees: true },
      { name: "Running Shoes, Grey & Blue", brand: "Campus", price: 899, mrp: 1999, quantity: "9", rating: 4.1, ratingCount: "5.2k", options: 5, badgeInRupees: true },
      { name: "Leather Wallet, Brown", brand: "WildHorn", price: 349, mrp: 999, quantity: "1 Pcs", rating: 4.3, ratingCount: "3.1k", badgeInRupees: true },
      { name: "Cotton Socks Pack of 5, Black", brand: "Jockey", price: 249, mrp: 399, quantity: "Pack Of 5", rating: 4.4, ratingCount: "1.4k" },
    ]),
  },
  {
    id: "kids-toys",
    name: "Kids & Toys",
    emoji: "🧸",
    products: make("kids-toys", [
      { name: "Lightning Sports Shoes for Kids (Grey & Green, 7 C)", brand: "Birde", price: 446, mrp: 1499, quantity: "7 C", rating: 4.2, ratingCount: "176", options: 5, badgeInRupees: true },
      { name: "Remote Control Car with Lights", brand: "Toyzone", price: 449, mrp: 999, quantity: "1 Pcs", rating: 4.0, ratingCount: "720", badgeInRupees: true },
      { name: "Building Blocks Set 200 Pcs", brand: "Funskool", price: 399, mrp: 799, quantity: "200 Pcs", rating: 4.4, ratingCount: "1.3k", badgeInRupees: true },
      { name: "Soft Teddy Bear 60 cm", brand: "Dimpy", price: 349, mrp: 699, quantity: "60 cm", rating: 4.3, ratingCount: "2.0k", options: 3, badgeInRupees: true },
      { name: "Baby Diapers Pants Medium (58 count)", brand: "Pampers", price: 699, mrp: 899, quantity: "58 Pcs", rating: 4.5, ratingCount: "8.4k" },
      { name: "School Bag 25 L for Kids", brand: "Skybags", price: 599, mrp: 1299, quantity: "25 L", rating: 4.2, ratingCount: "1.1k", options: 4, badgeInRupees: true },
    ]),
  },
  {
    id: "books-stationery",
    name: "Books & Stationery",
    emoji: "📚",
    products: make("books-stationery", [
      { name: "Classmate Notebook Pack of 6 (172 pages)", brand: "Classmate", price: 249, mrp: 330, quantity: "Pack Of 6", rating: 4.5, ratingCount: "2.7k" },
      { name: "Gel Pen Blue Pack of 20", brand: "Reynolds", price: 99, mrp: 140, quantity: "Pack Of 20", rating: 4.4, ratingCount: "3.9k", options: 3 },
      { name: "Atomic Habits (Paperback)", brand: "Penguin", price: 399, mrp: 599, quantity: "1 Pcs", rating: 4.7, ratingCount: "18k" },
      { name: "Geometry Box Set", brand: "Camlin", price: 129, mrp: 175, quantity: "1 Set", rating: 4.3, ratingCount: "1.5k" },
      { name: "A4 Copier Paper 500 Sheets", brand: "JK Copier", price: 289, mrp: 360, quantity: "500 Sheets", rating: 4.5, ratingCount: "2.2k" },
      { name: "Sketch Pens 24 Shades", brand: "Faber-Castell", price: 179, mrp: 240, quantity: "24 Pcs", rating: 4.4, ratingCount: "1.8k", options: 2 },
    ]),
  },
];

/* ------------------------------------------------------------------ */
/* helpers used by the product detail page                             */
/* ------------------------------------------------------------------ */

export function findProduct(id: string): { product: Product; category: Category } | null {
  for (const category of categories) {
    const product = category.products.find((p) => p.id === id);
    if (product) return { product, category };
  }
  return null;
}