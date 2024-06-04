import express from 'express';
import { verifyToken, isLeader, projectValidation } from '../validation';
import Project from '../models/project';
import { RequestHandler } from 'express';
import { CustomRequest } from '../interfaces/ICustomRequest';

const router = express.Router();

const getProjects: RequestHandler = async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

router.get('/', verifyToken as RequestHandler, getProjects);

// Get a specific project
router.get('/:id', verifyToken as RequestHandler, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.json(project);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

// Create a new project
router.post('/', verifyToken as RequestHandler, async (req, res) => {
    const { error } = projectValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Automatically assign the creator as the leader
    const project = new Project({
        ...req.body,
        teamMembers: [
            {
                userId: (req as CustomRequest).user._id,
                role: 'leader'
            }
        ]
    });

    try {
        const savedProject = await project.save();
        res.status(201).json(savedProject);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
});

// Update a project
router.put('/:id', verifyToken as RequestHandler, isLeader, async (req, res) => {
    const { error } = projectValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProject) return res.status(404).json({ message: "Project not found" });
        res.json(updatedProject);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
});

// Delete a project
router.delete('/:id', verifyToken as RequestHandler, isLeader, async (req, res) => {
    try {
        const removedProject = await Project.findByIdAndDelete(req.params.id);
        if (!removedProject) return res.status(404).json({ message: "Project not found" });
        res.json({ message: "Project deleted" });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

export default router;
