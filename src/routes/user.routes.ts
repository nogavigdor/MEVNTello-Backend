import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerValidation, loginValidation} from "../validation";
import { verifyToken } from "../middleware";
import { RequestHandler } from "express";
import User from "../models/user";
import { CustomRequest } from "../interfaces/ICustomRequest";
import user from "../models/user";

const router = express.Router();

// Get all users with specific fields
router.get("/", verifyToken as RequestHandler, async (req, res) => {
  try {
    // Use MongoDB projection to select only the _id, username, and email fields
    const users = await User.find({}, '_id username email').exec();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Registration Route
router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) {
    console.log('Validation error:', error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).json({ message: "Email already exists. Please enter a different Email" });

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    res.status(201).json({user: savedUser._id });
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
    { _id: user._id, username: user.username, email: user.email },
    process.env.TOKEN_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  console.log('Generated token:', token);
  console.log('User data:', { _id: user._id, username: user.username, email: user.email });

  res.header("auth-token", token).json({
    //include the token and user data in the response
    token,
    user: { _id: user._id, username: user.username, email: user.email }, 
  });
});

// Authenticated User Details Route
router.get('/me', verifyToken as RequestHandler, async (req, res) => {
  try {
    const customReq = req as CustomRequest;
    const user = await User.findById(customReq.user._id, '_id username role email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
export default router;
