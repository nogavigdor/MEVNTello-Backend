"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const validation_1 = require("../validation");
const task_1 = __importDefault(require("../models/task"));
const router = express_1.default.Router();
// Get all tasks
router.get('/', validation_1.verifyToken, async (req, res) => {
    try {
        const tasks = await task_1.default.find();
        res.json(tasks);
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
// Create a new task
router.post('/', validation_1.verifyToken, validation_1.isLeader, async (req, res) => {
    const { error } = (0, validation_1.taskValidation)(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    const task = new task_1.default(req.body);
    try {
        const savedTask = await task.save();
        res.status(201).json(savedTask);
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
// Update a task
router.put('/:id', validation_1.verifyToken, async (req, res) => {
    const { error } = (0, validation_1.taskValidation)(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    // Check if the update includes hoursUsed
    if ('hoursUsed' in req.body) {
        // Only task members can update hoursUsed
        await (0, validation_1.isTaskMember)(req, res, async () => {
            try {
                const updatedTask = await task_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
                if (!updatedTask)
                    return res.status(404).json({ message: "Task not found" });
                res.json(updatedTask);
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
    }
    else {
        // Other updates are allowed only for the leader
        await (0, validation_1.isLeader)(req, res, async () => {
            try {
                const updatedTask = await task_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
                if (!updatedTask)
                    return res.status(404).json({ message: "Task not found" });
                res.json(updatedTask);
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
    }
});
// Delete a task
router.delete('/:id', validation_1.verifyToken, validation_1.isLeader, async (req, res) => {
    try {
        const removedTask = await task_1.default.findByIdAndDelete(req.params.id);
        if (!removedTask)
            return res.status(404).json({ message: "Task not found" });
        res.json({ message: "Task deleted" });
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
// CRUD operations for subtasks
// Create a new subtask
router.post('/:taskId/subtasks', validation_1.verifyToken, validation_1.isTaskMember, async (req, res) => {
    const { taskId } = req.params;
    const { name, completed } = req.body;
    try {
        const task = await task_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        const subTask = { _id: new mongoose_1.Types.ObjectId(), name, completed: completed || false };
        task.subTasks.push(subTask);
        await task.save();
        res.status(201).json(subTask);
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
// Read all subtasks
router.get('/:taskId/subtasks', validation_1.verifyToken, validation_1.isTaskMember, async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await task_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        res.json(task.subTasks);
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
// Update a subtask
router.put('/:taskId/subtasks/:subtaskId', validation_1.verifyToken, validation_1.isTaskMember, async (req, res) => {
    const { taskId, subtaskId } = req.params;
    const { name, completed } = req.body;
    try {
        const task = await task_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        const subTask = task.subTasks.find((subtask) => subtask._id.toString() === subtaskId);
        if (!subTask)
            return res.status(404).json({ message: "Subtask not found" });
        if (name !== undefined)
            subTask.name = name;
        if (completed !== undefined)
            subTask.completed = completed;
        await task.save();
        res.json(subTask);
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
// Delete a subtask
router.delete('/:taskId/subtasks/:subtaskId', validation_1.verifyToken, validation_1.isTaskMember, async (req, res) => {
    const { taskId, subtaskId } = req.params;
    try {
        const task = await task_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        const subTaskIndex = task.subTasks.findIndex((subtask) => subtask._id.toString() === subtaskId);
        if (subTaskIndex === -1)
            return res.status(404).json({ message: "Subtask not found" });
        task.subTasks.splice(subTaskIndex, 1);
        await task.save();
        res.json({ message: "Subtask deleted" });
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
exports.default = router;
