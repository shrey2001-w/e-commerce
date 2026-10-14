import { Schema, models, model } from "mongoose";

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // snapshot of who ordered (kept even if the user later edits their profile)
    customer: {
      name: String,
      email: String,
      phone: String,
    },

    // delivery address at the time of the order
    address: {
      line: String,
      city: String,
      pincode: String,
    },

    items: [
      {
        productId: String,
        name: String,
        image: String,
        quantity: String, // pack size, e.g. "500 g"
        unitPrice: String,
        mrp: Number,
        price: Number,
        qty: Number,
        lineTotal: Number,
      },
    ],

    billing: {
      itemCount: Number,
      qtyCount: Number,
      mrpTotal: Number,
      discount: Number,
      platformFee: Number,
      gst: Number,
      total: Number,
    },

    total: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    // how the customer chose to pay: cod / upi (QR) / stripe
    paymentMethod: { type: String, enum: ["cod", "upi", "stripe"], default: "cod" },
    paymentStatus: {
      type: String,
      enum: ["pending", "awaiting_verification", "paid", "failed"],
      default: "pending",
    },
    paidAt: Date,

    // filled in by the Stripe webhook after a successful payment
    stripe: {
      sessionId: { type: String, index: true },
      paymentIntentId: String,
      amountPaid: Number,
      paymentMethodType: String, // what the customer actually used on Stripe: card, upi, netbanking...
      cardBrand: String,
      cardLast4: String,
      receiptUrl: String,
    },

    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    deliveryEstimate: String,

    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Order || model("Order", OrderSchema);