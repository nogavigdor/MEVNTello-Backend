import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken, isProjectMember, isLeader } from '../validation';
import List from '../models/list';
import { listValidation } from '../validation';
import { CustomRequest } from '../interfaces/ICustomRequest';

const router = express.Router();

// Get all lists for a project
router.get('/project/:projectId', verifyToken as RequestHandler, isProjectMember as RequestHandler, async (req, res) => {
    try {
        const lists = await List.find({ projectId: req.params.projectId });
        res.json(lists);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific list
router.get('/:id', verifyToken as RequestHandler, isLeader as RequestHandler, isProjectMember as RequestHandler, async (req, res) => {
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

// Update a list
router.put('/:id', verifyToken as RequestHandler, isLeader as RequestHandler, async (req, res) => {
    const { error } = listValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const updatedList = await List.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedList) return res.status(404).json({ message: 'List not found' });
        res.json(updatedList);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a list
router.delete('/:id', verifyToken as RequestHandler, isLeader as RequestHandler, async (req, res) => {
    try {
        const removedList = await List.findByIdAndDelete(req.params.id);
        if (!removedList) return res.status(404).json({ message: 'List not found' });
        res.json({ message: 'List deleted' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
