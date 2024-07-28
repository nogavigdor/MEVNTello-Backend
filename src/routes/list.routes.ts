import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken, isProjectMember, isLeader, isMemberOrLeader } from '../middleware';
import List from '../models/list';
import Project from '../models/project';
import { listValidation } from '../validation';
import { CustomRequest } from '../interfaces/ICustomRequest';

const router = express.Router();

// Get all lists for a project (id is the project ID)
router.get('/project/:id', verifyToken as RequestHandler, isMemberOrLeader,  async (req, res) => {
    try {
        // Get all lists for the project
        const lists = await List.find({ projectId: req.params.projectId });
        res.json(lists);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific list (id is the list ID)
router.get('/:id', verifyToken as RequestHandler, async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) return res.status(404).json({ message: 'List not found' });
        res.json(list);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new list
router.post('/', verifyToken as RequestHandler, isLeader as RequestHandler, async (req, res) => {
    const customReq = req as CustomRequest;
    
    const { error } = listValidation(customReq.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const projectId = customReq.body.projectId;
    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
    }

    // Automatically assign the project ID
    const list = new List({
        ...customReq.body,
        projectId: projectId,
    });

    try {
        const savedList = await list.save();
        res.status(201).json(savedList);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Update a list (id is the list ID)
router.put('/:id', verifyToken as RequestHandler, async (req, res) => {
    const customReq = req as CustomRequest;
    const { error } = listValidation(customReq.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const list = await List.findById(customReq.params.id);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const projectId = list.projectId;

        // Check if the user is a leader of the project
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isLeader = project.teamMembers.some(member => member._id.toString() === customReq.user._id && member.role === 'leader');
        if (!isLeader) return res.status(403).json({ message: 'Access Denied: You are not the leader of this project' });

        const updatedList = await List.findByIdAndUpdate(customReq.params.id, customReq.body, { new: true });
        res.json(updatedList);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});


// Delete a list (id is the list ID)
router.delete('/:id', verifyToken as RequestHandler, async (req, res) => {
    const customReq = req as CustomRequest;
    try {
        const list = await List.findById(customReq.params.id);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const projectId = list.projectId;

        // Check if the user is a leader of the project
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isLeader = project.teamMembers.some(member => member._id.toString() === customReq.user._id && member.role === 'leader');
        if (!isLeader) return res.status(403).json({ message: 'Access Denied: You are not the leader of this project' });

        await List.findByIdAndDelete(customReq.params.id);
        res.json({ message: 'List deleted' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
