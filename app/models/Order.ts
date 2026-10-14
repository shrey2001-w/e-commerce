import { Schema, models, model } from "mongoose";

const ItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: String, // pack size label, e.g. "500 g"
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    qty: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [ItemSchema], required: true },
    address: {
      line: String,
      city: String,
      pincode: String,
    },
    billing: {
      mrpTotal: Number,
      discount: Number,
      subtotal: Number,
      platformFee: Number,
      gst: Number,
      total: Number,
    },
    status: { type: String, default: "placed" },
  },
  { timestamps: true }
);

export default models.Order || model("Order", OrderSchema);