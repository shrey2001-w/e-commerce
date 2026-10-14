import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true }, // stored as a bcrypt hash

    // Delivery address (shown in the header after login)
    address: {
      line: { type: String, trim: true },
      city: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },

    // Forgot-password: we store only a SHA-256 hash of the emailed token
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);