import express from "express";

// import controller functions
import {
  createUser,
  getUsers,
  getUserById,
  resetUserPassword,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// define routes and link to controller functions
//When this route is hit -> run this controller function.
router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.put("/:id/password", resetUserPassword);
router.delete("/:id", deleteUser);

export default router;