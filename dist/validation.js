"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskValidation = exports.listValidation = exports.projectValidation = exports.verifyToken = exports.loginValidation = exports.registerValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Project Validation Schema
const projectValidation = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required().max(255),
        description: joi_1.default.string().allow('').max(1000),
        startDate: joi_1.default.date().required(),
        endDate: joi_1.default.date().required(),
        allocatedHours: joi_1.default.number().required().min(0),
        teamMembers: joi_1.default.array().items(joi_1.default.object({
            userId: joi_1.default.string().required(),
            role: joi_1.default.string().valid('leader', 'member').required()
        })).min(1),
        lists: joi_1.default.array().items(joi_1.default.string().required()).min(1),
        createdAt: joi_1.default.date().optional(),
        updatedAt: joi_1.default.date().optional()
    });
    return schema.validate(data);
};
exports.projectValidation = projectValidation;
// List Validation Schema
const listValidation = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required().max(255),
        projectId: joi_1.default.string().required(),
        tasks: joi_1.default.array().items(joi_1.default.string().required()).min(1),
        createdAt: joi_1.default.date().optional(),
        updatedAt: joi_1.default.date().optional()
    });
    return schema.validate(data);
};
exports.listValidation = listValidation;
// Task Validation Schema
const taskValidation = (data) => {
    const schema = joi_1.default.object({
        listId: joi_1.default.string().required(),
        name: joi_1.default.string().required().max(255),
        description: joi_1.default.string().required().max(255),
        assignedMembers: joi_1.default.array().items(joi_1.default.string().required()).min(1),
        hoursAllocated: joi_1.default.number().required().min(0),
        hoursUsed: joi_1.default.number().required().min(0),
        status: joi_1.default.string().valid('todo', 'inProgress', 'done').required(),
        subTasks: joi_1.default.array().items(joi_1.default.object({
            name: joi_1.default.string().required(),
            completed: joi_1.default.boolean().required()
        })),
        createdAt: joi_1.default.date().optional(),
        updatedAt: joi_1.default.date().optional()
    });
    return schema.validate(data);
};
exports.taskValidation = taskValidation;
// Registration Validation Schema
const registerValidation = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().min(6).max(255).required(),
        email: joi_1.default.string().min(6).max(255).required().email(),
        password: joi_1.default.string().min(6).max(255).required()
    });
    return schema.validate(data);
};
exports.registerValidation = registerValidation;
// Login Validation Schema
const loginValidation = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().min(6).max(255).required().email(),
        password: joi_1.default.string().min(6).max(255).required()
    });
    return schema.validate(data);
};
exports.loginValidation = loginValidation;
const verifyToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token)
        return res.status(401).json({ message: 'Access Denied' });
    try {
        const verified = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    }
    catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};
exports.verifyToken = verifyToken;
