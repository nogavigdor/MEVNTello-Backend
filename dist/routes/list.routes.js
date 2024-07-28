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
const router = express_1.default.Router();
// Get all lists for a project (id is the project ID)
router.get('/project/:id', middleware_1.verifyToken, middleware_1.isMemberOrLeader, async (req, res) => {
    try {
        // Get all lists for the project
        const lists = await list_1.default.find({ projectId: req.params.projectId });
        res.json(lists);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Get a specific list (id is the list ID)
router.get('/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const list = await list_1.default.findById(req.params.id);
        if (!list)
            return res.status(404).json({ message: 'List not found' });
        const projectId = list.projectId;
        //find the project to check if the user is included in the team
        const project = await project_1.default.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        //checks if the user is a member of the project
        const isMember = project.teamMembers.some(member => member._id.toString() === req.user._id);
        //if the user is not a member of the project
        if (!isMember)
            return res.status(403).json({ message: 'Access Denied: You are not a member of this project' });
        //return the list
        res.json(list);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Create a new list
router.post('/', middleware_1.verifyToken, middleware_1.isLeader, async (req, res) => {
    const customReq = req;
    const { error } = (0, validation_1.listValidation)(customReq.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    const projectId = customReq.body.projectId;
    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
    }
    // Automatically assign the project ID
    const list = new list_1.default({
        ...customReq.body,
        projectId: projectId,
    });
    try {
        const savedList = await list.save();
        res.status(201).json(savedList);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Update a list (id is the list ID)
router.put('/:id', middleware_1.verifyToken, async (req, res) => {
    const customReq = req;
    const { error } = (0, validation_1.listValidation)(customReq.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    try {
        const list = await list_1.default.findById(customReq.params.id);
        if (!list)
            return res.status(404).json({ message: 'List not found' });
        const projectId = list.projectId;
        // Check if the user is a leader of the project
        const project = await project_1.default.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const isLeader = project.teamMembers.some(member => member._id.toString() === customReq.user._id && member.role === 'leader');
        if (!isLeader)
            return res.status(403).json({ message: 'Access Denied: You are not the leader of this project' });
        const updatedList = await list_1.default.findByIdAndUpdate(customReq.params.id, customReq.body, { new: true });
        res.json(updatedList);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Delete a list (id is the list ID)
router.delete('/:id', middleware_1.verifyToken, async (req, res) => {
    const customReq = req;
    try {
        const list = await list_1.default.findById(customReq.params.id);
        if (!list)
            return res.status(404).json({ message: 'List not found' });
        const projectId = list.projectId;
        // Check if the user is a leader of the project
        const project = await project_1.default.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const isLeader = project.teamMembers.some(member => member._id.toString() === customReq.user._id && member.role === 'leader');
        if (!isLeader)
            return res.status(403).json({ message: 'Access Denied: You are not the leader of this project' });
        await list_1.default.findByIdAndDelete(customReq.params.id);
        res.json({ message: 'List deleted' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = router;
