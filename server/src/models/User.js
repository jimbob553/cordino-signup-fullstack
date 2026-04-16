import mongoose from "mongoose";

/* Schema defines the shape + validation rules.
   required, match, maxlength are constraints.*/
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"], // custom error message
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      unique: true,  // prevents duplicate emails
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
      unique: true,
    },

    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false, // <-- important: do not return by default
    },


    // Payment fields (store responsibly)
    cardLast4: {
      type: String,
      required: [true, "Card last4 is required"],
      match: [/^\d{4}$/, "Card last4 must be 4 digits"],
    },
    cardExp: {
      type: String,
      required: [true, "Card expiration is required"],
      // Accepts "MM/YY" or "MM/YYYY"
      match: [/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/, "Expiration must be MM/YY or MM/YYYY"],
    },

    //  CVV is intentionally NOT stored
  },
  // Adds createdAt / updatedAt automatically
  { timestamps: true }
);

// Prevent model overwrite in watch/hot-reload edge cases
export default mongoose.models.User || mongoose.model("User", userSchema);
