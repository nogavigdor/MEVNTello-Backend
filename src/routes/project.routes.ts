import express from 'express';
import { verifyToken, isLeader, isProjectMember, isMemberOrLeader } from '../middleware';
import { projectValidation } from '../validation';
import Project from '../models/project';
import { RequestHandler } from 'express';
import { CustomRequest } from '../interfaces/ICustomRequest';

const router = express.Router();



// Get all projects
router.get('/', verifyToken as RequestHandler, async (req, res) => {
    const customReq = req as CustomRequest;
    try {
        const projects = await Project.find({
            'teamMembers._id': customReq.user._id
        });
        res.json(projects);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

//Get all projects for a specific user
router.get('/user/:id', verifyToken as RequestHandler, async (req, res) => {
    try {
        console.log('Route /user/:id matched');
        console.log('Fetching projects for user:', req.params.id);
        const projects = await Project.find({
            'teamMembers._id': req.params.id
        });
        res.json(projects);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

// Get a specific project (id is the project ID)
router.get('/:id', verifyToken as RequestHandler, isMemberOrLeader as RequestHandler, async (req, res) => {
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
    const customReq = req as CustomRequest;
    console.log('User from token:', customReq.user); // Log the user from the token
   
    const { error } = projectValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Destructure the request body
    const { name, description, startDate, endDate, allocatedHours, teamMembers, creator, lists } = req.body;
    
    // Create a new project
    const project = new Project({
        name,
        description,
        startDate,
        endDate,
        allocatedHours,
        creator,
        teamMembers: [
            {
                // Add the user from the token as the leader
                _id: (req as CustomRequest).user._id,
                role: 'leader'
            },
            // Add team members from the request body
            ...teamMembers // Include team members from the request body
        ],
        lists
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

// Update a project (id is the project ID)
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

// Delete a project (id is the project ID)
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
