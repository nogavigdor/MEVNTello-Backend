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
// Registration Route
router.post('/register', async (req, res) => {
    const { error } = (0, validation_1.registerValidation)(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    const emailExist = await user_1.default.findOne({ email: req.body.email });
    if (emailExist)
        return res.status(400).json({ message: "Email already exists" });
    try {
        const savedUser = await new user_1.default(req.body).save();
        res.status(201).json({ user: savedUser._id });
    }
    catch (err) { // Cast 'err' to 'any' type
        res.status(400).json({ message: err.message });
    }
});
// Login Route
router.post('/login', async (req, res) => {
    const { error } = (0, validation_1.loginValidation)(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    const user = await user_1.default.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).json({ message: "Email is not found" });
    const validPass = await bcrypt_1.default.compare(req.body.password, user.password);
    if (!validPass)
        return res.status(400).json({ message: "Invalid password" });
    const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.TOKEN_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.header('auth-token', token).json({
        token,
        user: { id: user._id, email: user.email }
    });
});
exports.default = router;
