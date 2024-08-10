"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware");
const list_1 = __importDefault(require("../models/list"));
const project_1 = __importDefault(require("../models/project"));
const validation_1 = require("../validation");
const validation_2 = require("../validation");
const task_1 = __importDefault(require("../models/task"));
const router = express_1.default.Router();
// Get all lists for a project (id is the project ID)
router.get('/project/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const customReq = req;
        const userId = customReq.user._id;
        const isAdmin = customReq.user.role === 'admin';
        // Fetch the project by ID
        const project = await project_1.default.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        // If the user is not an admin, check if they are a member or leader of the project
        if (!isAdmin) {
            const isMemberOrLeader = project.teamMembers.some(member => member._id.toString() === userId);
            if (!isMemberOrLeader) {
                return res.status(403).json({ message: 'Access Denied: You are not a team member of this project' });
            }
        }
        // Get all lists for the project
        const lists = await list_1.default.find({ projectId: req.params.id });
        res.json(lists);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
// Get a specific list (id is the list ID)
router.get('/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const customReq = req;
        const userId = customReq.user._id;
        const isAdmin = customReq.user.role === 'admin';
        // Find the list by ID
        const list = await list_1.default.findById(req.params.id);
        if (!list)
            return res.status(404).json({ message: 'List not found' });
        const projectId = list.projectId;
        // Find the project to check if the user is included in the team
        const project = await project_1.default.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        // Check if the user is an admin or a member of the project
        const isMember = project.teamMembers.some(member => member._id.toString() === userId);
        if (!isAdmin && !isMember) {
            return res.status(403).json({ message: 'Access Denied: You are not a member of this project' });
        }
        // Return the list
        res.json(list);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
// Create a new list - admin or project leader only
router.post('/', middleware_1.verifyToken, async (req, res) => {
    const customReq = req;
    const { error } = (0, validation_1.listValidation)(customReq.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    const projectId = customReq.body.projectId;
    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
    }
    // Check if the user is an admin
    const isAdmin = customReq.user.role === 'admin';
    // Check if the user is a leader of the project
    const project = await project_1.default.findById(projectId);
    if (!project)
        return res.status(404).json({ message: 'Project not found' });
    const isLeader = project.teamMembers.some(member => member._id.toString() === customReq.user._id && member.role === 'leader');
    if (!isAdmin && !isLeader) {
        return res.status(403).json({ message: 'Access Denied: You are not authorized to create a list for this project' });
    }
    // Automatically assign the project ID
    const list = new list_1.default({
        ...customReq.body,
    });
    try {
        const savedList = await list.save();
        // Update the project document with the new list ID
        project.lists?.push(savedList._id);
        // Save the updated project
        await project.save();
        res.status(201).json(savedList);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ message: err.message });
        }
        else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
});
/// Update a list (id is the list ID) - admin or project leader only
router.put('/:id', middleware_1.verifyToken, async (req, res) => {
    const customReq = req;
    const { error } = (0, validation_2.listUpdateValidation)(customReq.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    try {
        const list = await list_1.default.findById(customReq.params.id);
        if (!list)
            return res.status(404).json({ message: 'List not found' });
        const projectId = list.projectId;
        // Check if the user is an admin
        const isAdmin = customReq.user.role === 'admin';
        // Check if the user is a leader of the project
        const project = await project_1.default.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const isLeader = project.teamMembers.some(member => member._id.toString() === customReq.user._id && member.role === 'leader');
        if (!isAdmin && !isLeader) {
            return res.status(403).json({ message: 'Access Denied: You are not authorized to update this list' });
        }
        const updatedList = await list_1.default.findByIdAndUpdate(customReq.params.id, customReq.body, { new: true });
        res.json(updatedList);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ message: err.message });
        }
        else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
});
// Delete a list (id is the list ID) - admin or project leader only
router.delete('/:id', middleware_1.verifyToken, async (req, res) => {
    const customReq = req;
    try {
        const list = await list_1.default.findById(customReq.params.id);
        if (!list)
            return res.status(404).json({ message: 'List not found' });
        // Retrieve the project ID from the list
        const projectId = list.projectId;
        // Check if the user is an admin
        const isAdmin = customReq.user.role === 'admin';
        // Check if the user is a leader of the project
        const project = await project_1.default.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const isLeader = project.teamMembers.some(member => member._id.toString() === customReq.user._id && member.role === 'leader');
        if (!isAdmin && !isLeader) {
            return res.status(403).json({ message: 'Access Denied: You are not authorized to delete this list' });
        }
        // Delete the tasks associated with this list
        await task_1.default.deleteMany({ _id: { $in: list.tasks } });
        await list_1.default.findByIdAndDelete(customReq.params.id);
        res.json({ message: 'List and its related tasks are deleted' });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.default = router;
