"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware");
const validation_1 = require("../validation");
const validation_2 = require("../validation");
const project_1 = __importDefault(require("../models/project"));
const router = express_1.default.Router();
// Get all projects
router.get('/', middleware_1.verifyToken, async (req, res) => {
    const customReq = req;
    try {
        const projects = await project_1.default.find({
            'teamMembers._id': customReq.user._id
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
//Get all projects for a specific user
router.get('/user/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        console.log('Route /user/:id matched');
        console.log('Fetching projects for user:', req.params.id);
        const projects = await project_1.default.find({
            'teamMembers._id': req.params.id
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
router.get('/:id', middleware_1.verifyToken, middleware_1.isMemberOrLeader, async (req, res) => {
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
router.post('/', middleware_1.verifyToken, async (req, res) => {
    const customReq = req;
    console.log('User from token:', customReq.user); // Log the user from the token
    const { error } = (0, validation_1.projectValidation)(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    // Destructure the request body
    const { name, description, startDate, endDate, allocatedHours, teamMembers, creator, lists } = req.body;
    // Create a new project
    const project = new project_1.default({
        name,
        creationStatus: 'tasks',
        description,
        startDate,
        endDate,
        allocatedHours,
        creator,
        teamMembers: [
            {
                // Add the user from the token as the leader
                _id: req.user._id,
                role: 'leader'
            },
            // Add team members from the request body
            ...teamMembers // Include team members from the request body
        ],
        lists: []
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
router.put('/:id', middleware_1.verifyToken, middleware_1.isLeader, async (req, res) => {
    const { error } = (0, validation_2.projectUpdateValidation)(req.body);
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
router.delete('/:id', middleware_1.verifyToken, middleware_1.isLeader, async (req, res) => {
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
