"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTaskMember = exports.isMemberOrLeader = exports.isProjectMember = exports.isLeader = exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("./models/user"));
const project_1 = __importDefault(require("./models/project"));
const task_1 = __importDefault(require("./models/task"));
// Token Verification Middleware
const verifyToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token)
        return res.status(401).json({ message: 'Access Denied' });
    try {
        const verified = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
        //attaches the user data to the request object
        req.user = verified;
        next();
    }
    catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};
exports.verifyToken = verifyToken;
//check if the user is an admin
const isAdmin = async (req, res, next) => {
    //find the user by id
    const user = await user_1.default.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if (user.role === 'admin') {
        return next(); // If the user is admin, skip the next middleware
    }
    next();
};
exports.isAdmin = isAdmin;
// Check if the user is a  leader - when project id is a parameter or in the request body
const isLeader = async (req, res, next) => {
    const projectId = req.params.id || req.body.projectId;
    if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
    }
    const project = await project_1.default.findById(projectId);
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    //checks if the user is a leader
    const isLeader = project.teamMembers.some(member => member._id.toString() === req.user._id && member.role === 'leader');
    if (!isLeader) {
        return res.status(403).json({ message: 'Access Denied: You are not the leader of this project' });
    }
    next();
};
exports.isLeader = isLeader;
// Check if the user is a team member (and not a leader) - only for project routes
const isProjectMember = async (req, res, next) => {
    const projectId = req.params.id || req.body.projectId;
    if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
    }
    const project = await project_1.default.findById(projectId);
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    //checks if the user is a member
    const isMember = project.teamMembers.some(member => member._id.toString() === req.user._id && member.role === 'member');
    if (!isMember) {
        return res.status(403).json({ message: 'Access Denied: You are not a team member of this project' });
    }
    next();
};
exports.isProjectMember = isProjectMember;
// Check if the user is a team member or leader (only for project routes)
const isMemberOrLeader = async (req, res, next) => {
    const customReq = req;
    // First, allow admins to bypass the check
    if (customReq.user.role === 'admin') {
        return next();
    }
    const projectId = req.params.id || req.body.projectId;
    const project = await project_1.default.findById(projectId);
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    // Check if the user is a member or leader
    const isMemberOrLeader = project.teamMembers.some(member => member._id.toString() === customReq.user._id);
    if (!isMemberOrLeader) {
        return res.status(403).json({ message: 'Access Denied: You are not a team member of this project' });
    }
    next();
};
exports.isMemberOrLeader = isMemberOrLeader;
//Checks if the user is task member
const isTaskMember = async (req, res, next) => {
    const taskId = req.params.id || req.body.taskId;
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
