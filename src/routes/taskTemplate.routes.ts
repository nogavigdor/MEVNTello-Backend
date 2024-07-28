// src/routes/taskTemplate.routes.ts
import express, { RequestHandler } from 'express';
import { verifyToken } from '../validation';
import { isAdmin } from '../validation';

import TaskTemplate from '../models/taskTemplate';

const router = express.Router();

// Create a new task template (Admin only)
router.post('/', verifyToken as RequestHandler, isAdmin as RequestHandler, async (req, res) => {
  const { name, lists } = req.body;

  

  const taskTemplate = new TaskTemplate({ name, lists });

  try {
    const savedTemplate = await taskTemplate.save();
    res.status(201).json(savedTemplate);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Fetch all task templates
router.get('/', verifyToken as RequestHandler, async (req, res) => {
  try {
    const templates = await TaskTemplate.find();
    res.json(templates);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch a single task template by ID
router.get('/:id', verifyToken as RequestHandler, async (req, res) => {
  try {
    const template = await TaskTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update a task template (Admin only)
router.put('/:id', verifyToken as RequestHandler, isAdmin as RequestHandler, async (req, res) => {
  const { name, lists } = req.body;

  try {
    const updatedTemplate = await TaskTemplate.findByIdAndUpdate(
      req.params.id,
      { name, lists },
      { new: true }
    );
    if (!updatedTemplate) return res.status(404).json({ message: 'Template not found' });
    res.json(updatedTemplate);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a task template (Admin only)
router.delete('/:id', verifyToken as RequestHandler, isAdmin as RequestHandler, async (req, res) => {
  try {
    const removedTemplate = await TaskTemplate.findByIdAndDelete(req.params.id);
    if (!removedTemplate) return res.status(404).json({ message: 'Template not found' });
    res.json({ message: 'Template deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
