"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation_1 = require("../validation");
const user_1 = __importDefault(require("../models/user"));
const router = express_1.default.Router();
// Get all users with specific fields
router.get("/", validation_1.verifyToken, async (req, res) => {
    try {
        // Use MongoDB projection to select only the _id, username, and email fields
        const users = await user_1.default.find({}, '_id username email').exec();
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Registration Route
router.post("/register", async (req, res) => {
    const { error } = (0, validation_1.registerValidation)(req.body);
    if (error) {
        console.log('Validation error:', error.details[0].message);
        return res.status(400).json({ message: error.details[0].message });
    }
    const emailExist = await user_1.default.findOne({ email: req.body.email });
    if (emailExist)
        return res.status(400).json({ message: "Email already exists" });
    // Hash the password
    const salt = await bcrypt_1.default.genSalt(10);
    const hashedPassword = await bcrypt_1.default.hash(req.body.password, salt);
    console.log('Hashed password:', hashedPassword);
    const user = new user_1.default({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
    });
    try {
        const savedUser = await user.save();
        res.status(201).json({ user: savedUser._id });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Login Route
router.post("/login", async (req, res) => {
    console.log('Login request received:', req.body); // Log the request payload
    const { error } = (0, validation_1.loginValidation)(req.body);
    if (error) {
        console.log('Validation error:', error.details[0].message);
        return res.status(400).json({ message: error.details[0].message });
    }
    const user = await user_1.default.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).json({ message: "Email is not found" });
    console.log('Input password:', req.body.password);
    console.log('Stored password hash:', user.password);
    const validPass = await bcrypt_1.default.compare(req.body.password, user.password);
    if (!validPass)
        return res.status(400).json({ message: "Invalid password" });
    const token = jsonwebtoken_1.default.sign({ _id: user._id, username: user.username, email: user.email }, process.env.TOKEN_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    console.log('Generated token:', token);
    console.log('User data:', { _id: user._id, username: user.username, email: user.email });
    res.header("auth-token", token).json({
        //include the token and user data in the response
        token,
        user: { _id: user._id, username: user.username, email: user.email },
    });
});
exports.default = router;
