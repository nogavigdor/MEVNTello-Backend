"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTaskMember = exports.isProjectMember = exports.isLeader = exports.taskValidation = exports.listValidation = exports.projectValidation = exports.verifyToken = exports.loginValidation = exports.registerValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const project_1 = __importDefault(require("./models/project"));
const task_1 = __importDefault(require("./models/task"));
// Project Validation Schema
const projectValidation = (data) => {
    const schema = joi_1.default.object({
        _id: joi_1.default.string().optional(),
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
        _id: joi_1.default.string().optional(),
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
        _id: joi_1.default.string().optional(),
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
        _id: joi_1.default.string().optional(),
        username: joi_1.default.string().min(6).max(255).required(),
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
// Token Verification Middleware
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
// Check if the user is a team member and leader
const isLeader = async (req, res, next) => {
    const projectId = req.params.id;
    const project = await project_1.default.findById(projectId);
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    const isLeader = project.teamMembers.some(member => member.userId.toString() === req.user._id && member.role === 'leader');
    if (!isLeader) {
        return res.status(403).json({ message: 'Access Denied: You are not the leader of this project' });
    }
    next();
};
exports.isLeader = isLeader;
// Check if the user is a team member
const isProjectMember = async (req, res, next) => {
    const projectId = req.params.id || req.body.projectId; // Adjust to ensure it checks both params and body
    const project = await project_1.default.findById(projectId);
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    const isMember = project.teamMembers.some(member => member.userId.toString() === req.user._id);
    if (!isMember) {
        return res.status(403).json({ message: 'Access Denied: You are not a team member of this project' });
    }
    next();
};
exports.isProjectMember = isProjectMember;
//Checks if the user is task member
const isTaskMember = async (req, res, next) => {
    const taskId = req.params.id || req.body.taskId; // Adjust to ensure it checks both params and body
    const task = await task_1.default.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    const isMember = task.assignedMembers.some(member => member.toString() === req.user._id);
    if (!isMember) {
        return res.status(403).json({ message: 'Access Denied: You are not a team member of this task' });
    }
    next();
};
exports.isTaskMember = isTaskMember;
