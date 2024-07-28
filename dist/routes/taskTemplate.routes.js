"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/taskTemplate.routes.ts
const express_1 = __importDefault(require("express"));
const validation_1 = require("../validation");
const validation_2 = require("../validation");
const taskTemplate_1 = __importDefault(require("../models/taskTemplate"));
const router = express_1.default.Router();
// Create a new task template (Admin only)
router.post('/', validation_1.verifyToken, validation_2.isAdmin, async (req, res) => {
    const { name, lists } = req.body;
    const taskTemplate = new taskTemplate_1.default({ name, lists });
    try {
        const savedTemplate = await taskTemplate.save();
        res.status(201).json(savedTemplate);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Fetch all task templates
router.get('/', validation_1.verifyToken, async (req, res) => {
    try {
        const templates = await taskTemplate_1.default.find();
        res.json(templates);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Fetch a single task template by ID
router.get('/:id', validation_1.verifyToken, async (req, res) => {
    try {
        const template = await taskTemplate_1.default.findById(req.params.id);
        if (!template)
            return res.status(404).json({ message: 'Template not found' });
        res.json(template);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Update a task template (Admin only)
router.put('/:id', validation_1.verifyToken, validation_2.isAdmin, async (req, res) => {
    const { name, lists } = req.body;
    try {
        const updatedTemplate = await taskTemplate_1.default.findByIdAndUpdate(req.params.id, { name, lists }, { new: true });
        if (!updatedTemplate)
            return res.status(404).json({ message: 'Template not found' });
        res.json(updatedTemplate);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Delete a task template (Admin only)
router.delete('/:id', validation_1.verifyToken, validation_2.isAdmin, async (req, res) => {
    try {
        const removedTemplate = await taskTemplate_1.default.findByIdAndDelete(req.params.id);
        if (!removedTemplate)
            return res.status(404).json({ message: 'Template not found' });
        res.json({ message: 'Template deleted' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = router;
