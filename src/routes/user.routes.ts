import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerValidation, loginValidation } from "../validation";
import User from "../models/user";

const router = express.Router();

// Registration Route
router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) {
    console.log('Validation error:', error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).json({ message: "Email already exists" });

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  console.log('Hashed password:', hashedPassword);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    res.status(201).json({ user: savedUser._id });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
console.log('Login request received:', req.body);  // Log the request payload
const { error } = loginValidation(req.body);
if (error) {
    console.log('Validation error:', error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
}

const user = await User.findOne({ email: req.body.email });

if (!user) return res.status(400).json({ message: "Email is not found" });

console.log('Input password:', req.body.password);
console.log('Stored password hash:', user.password);

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign(
    { _id: user._id, username:user.username, email: user.email },
    process.env.TOKEN_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.header("auth-token", token).json({
    //include the token and user data in the response
    token,
    user: { _id: user._id, username: user.username, email: user.email }, 
  });
});

export default router;
