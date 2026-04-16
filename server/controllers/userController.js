import mongoose from "mongoose";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";
/************************
 * The controller’s responsibilities are:

Receive an HTTP request (req)

Validate input (sometimes)

Call the model / database (via Mongoose)

Handle errors

Send an HTTP response (res)
 */


/**
 * POST /api/users
 * Creates a new user (signup)
*/
// Async functions let JavaScript wait for slow things without without blocking the event loop.
export async function createUser(req, res) {
  try {
    // extract fields from request body
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      confirmPassword,
      cardLast4,
      cardExp,
    } = req.body;

    // Required fields
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({
        message: "firstName, lastName, email, username, and password are required",
      });
    }

    // Confirm password match
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        field: "confirmPassword",
      });
    }

    // Basic password rule 
    if (String(password).length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
        field: "password",
      });
    }
    // Hash password
    // bcrypt hashes passwords securely before storing them.
    // "10" is the cost factor (salt rounds) = how expensive/slow hashing is
    const passwordHash = await bcrypt.hash(password, 10);
    // Create user in DB
    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      passwordHash,
      cardLast4,
      cardExp,
    });
    // Success response but no passwordHash or sensitive info (cc stuff) in response
    return res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    // Duplicate key error (unique index)
    // MongoDB error code 11000 means it violates the unique: true constraint
    if (err?.code === 11000) {
      const field =
      // which field caused the duplicate key error || then get from keyValue
        Object.keys(err.keyPattern || err.keyValue || {})[0] || "unknown";
      return res.status(409).json({
        // which field is duplicated
        message: `${field} already in use`,
        field,
      });
    }
    // Mongoose schema validation errors 
    if (err?.name === "ValidationError") {
      // Convert Mongoose validation error objects into an array of readable messages 
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        message: "Validation failed",
        // array of validation error messages to send to client
        errors,
      });
    }

    console.error("createUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * GET /api/users
 * Admin – list all users
 */
export async function getUsers(req, res) {
  try {
    // Fetch users, exclude sensitive fields
    const users = await User.find()
      // only return non-sensitive fields
    .select("firstName lastName email username createdAt")
      // sort by newest first
    .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (err) {
    // log and return server error
    console.error("getUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/users/:id
export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    //  errors for invalid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    
    // Fetch user by ID, exclude sensitive fields
    const user = await User.findById(id).select(
      "firstName lastName email username cardLast4 cardExp createdAt"
    );
    // If not found, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/users/:id
export async function updateUser(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // allowed update fields   username and password cannot be changed here
    const allowed = ["firstName", "lastName", "email", "cardLast4", "cardExp"];
    // build updates object
    const updates = {};
    // copy allowed fields to updates if provided by req.body
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    // perform update ( applies only the updates object)
    const updated = await User.findByIdAndUpdate(id, updates, {
      new: true,            // return updated doc 
      runValidators: true,  // enforce schema rules on update
    }). // limits what fields are returned
    select("firstName lastName email cardLast4 cardExp createdAt");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    // return success response with updated user
    return res.status(200).json({
      message: "User updated",
      user: updated,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "Email already in use",
        field: "email",
      });
    }

    if (err?.name === "ValidationError") {  // Mongoose schema validation errors 
      // if validation fails extract messages
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }

    console.error("updateUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/users/:id/password
export async function resetUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { password, confirmPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (!password) {                                                // Include "field" so the frontend can highlight/show which input is invalid
      return res.status(400).json({ message: "Password is required", field: "password" });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match", field: "confirmPassword" });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters", field: "password" });
    }
    // Hash new password (10 = bcrypt cost factor / salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    const updated = await User.findByIdAndUpdate(
      id,
      // set new password hash
      { passwordHash },
      // options
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("resetUserPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    
    // perform delete         // findByIdAndDelete is a Mongoose method
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}