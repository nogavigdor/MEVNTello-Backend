"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_1 = require("../validation");
const project_1 = __importDefault(require("../models/project"));
const router = express_1.default.Router();
// Get all projects
router.get('/', validation_1.verifyToken, async (req, res) => {
    const customReq = req;
    try {
        const projects = await project_1.default.find({
            'teamMembers.userId': customReq.user._id
        });
        res.json(projects);
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
// Get a specific project (id is the project ID)
router.get('/:id', validation_1.verifyToken, validation_1.isMemberOrLeader, async (req, res) => {
    try {
        const project = await project_1.default.findById(req.params.id);
        if (!project)
            return res.status(404).json({ message: "Project not found" });
        res.json(project);
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
// Create a new project
router.post('/', validation_1.verifyToken, async (req, res) => {
    const customReq = req;
    console.log('User from token:', customReq.user); // Log the user from the token
    const { error } = (0, validation_1.projectValidation)(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    // Automatically assign the creator as the leader
    const project = new project_1.default({
        ...req.body,
        teamMembers: [
            {
                userId: req.user._id,
                role: 'leader'
            }
        ]
    });
    try {
        const savedProject = await project.save();
        res.status(201).json(savedProject);
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
// Update a project (id is the project ID)
router.put('/:id', validation_1.verifyToken, validation_1.isLeader, async (req, res) => {
    const { error } = (0, validation_1.projectValidation)(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    try {
        const updatedProject = await project_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProject)
            return res.status(404).json({ message: "Project not found" });
        res.json(updatedProject);
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
// Delete a project (id is the project ID)
router.delete('/:id', validation_1.verifyToken, validation_1.isLeader, async (req, res) => {
    try {
        const removedProject = await project_1.default.findByIdAndDelete(req.params.id);
        if (!removedProject)
            return res.status(404).json({ message: "Project not found" });
        res.json({ message: "Project deleted" });
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
