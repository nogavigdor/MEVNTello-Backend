"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_1 = require("../validation");
const list_1 = __importDefault(require("../models/list"));
const project_1 = __importDefault(require("../models/project"));
const validation_2 = require("../validation");
const router = express_1.default.Router();
// Get all lists for a project (id is the project ID)
router.get('/project/:id', validation_1.verifyToken, validation_1.isMemberOrLeader, async (req, res) => {
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
router.get('/:id', validation_1.verifyToken, async (req, res) => {
    try {
        const list = await list_1.default.findById(req.params.id);
        if (!list)
            return res.status(404).json({ message: 'List not found' });
        res.json(list);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Create a new list
router.post('/', validation_1.verifyToken, validation_1.isLeader, async (req, res) => {
    const customReq = req;
    const { error } = (0, validation_2.listValidation)(customReq.body);
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
router.put('/:id', validation_1.verifyToken, async (req, res) => {
    const customReq = req;
    const { error } = (0, validation_2.listValidation)(customReq.body);
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
        const isLeader = project.teamMembers.some(member => member.userId.toString() === customReq.user._id && member.role === 'leader');
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
router.delete('/:id', validation_1.verifyToken, async (req, res) => {
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
        const isLeader = project.teamMembers.some(member => member.userId.toString() === customReq.user._id && member.role === 'leader');
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
