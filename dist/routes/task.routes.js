"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const middleware_1 = require("../middleware");
const validation_1 = require("../validation");
const task_1 = __importDefault(require("../models/task"));
const list_1 = __importDefault(require("../models/list"));
const router = express_1.default.Router();
// Get all tasks assigned to the authenticated user
router.get('/', middleware_1.verifyToken, async (req, res) => {
    const customReq = req;
    try {
        const tasks = await task_1.default.find({ assignedMembers: customReq.user._id });
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
// Get all tasks for a specific list (id is the list ID)
router.get('/list/:id', middleware_1.verifyToken, async (req, res) => {
    try {
        const tasks = await task_1.default.find({ listId: req.params.id });
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
// Create a new task (only by leaders)
router.post('/:listId', middleware_1.verifyToken, async (req, res, next) => {
    const customReq = req;
    const listId = req.params.listId;
    try {
        const list = await list_1.default.findById(listId);
        if (!list)
            return res.status(404).json({ message: 'List not found' });
        // Add projectId to the body for isLeader middleware
        req.body.projectId = list.projectId;
        // Verify if the user is a leader of the project
        await (0, middleware_1.isLeader)(req, res, next);
        const { error } = (0, validation_1.taskValidation)(req.body);
        if (error)
            return res.status(400).json({ message: error.details[0].message });
        const task = new task_1.default({
            ...req.body,
            listId: listId
        });
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
// Update a task - id is the task ID, only task members can update hoursUsed, other updates are allowed only for the leader
router.put('/:id', middleware_1.verifyToken, async (req, res, next) => {
    const customReq = req;
    const { error } = (0, validation_1.taskValidation)(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    try {
        const task = await task_1.default.findById(req.params.id);
        if (!task)
            return res.status(404).json({ message: 'Task not found' });
        const list = await list_1.default.findById(task.listId);
        if (!list)
            return res.status(404).json({ message: 'List not found' });
        // Add projectId to the body for isLeader middleware
        req.body.projectId = list.projectId;
        // Check if the update includes hoursUsed
        if ('hoursUsed' in req.body) {
            // Only task members can update hoursUsed
            await (0, middleware_1.isTaskMember)(req, res, async () => {
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
            await (0, middleware_1.isLeader)(req, res, async () => {
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
// Delete a task
router.delete('/:id', middleware_1.verifyToken, async (req, res, next) => {
    const customReq = req;
    try {
        const task = await task_1.default.findById(req.params.id);
        if (!task)
            return res.status(404).json({ message: 'Task not found' });
        const list = await list_1.default.findById(task.listId);
        if (!list)
            return res.status(404).json({ message: 'List not found' });
        // Add projectId to the body for isLeader middleware
        req.body.projectId = list.projectId;
        await (0, middleware_1.isLeader)(req, res, next);
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
router.post('/:taskId/subtasks', middleware_1.verifyToken, middleware_1.isTaskMember, async (req, res) => {
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
router.get('/:taskId/subtasks', middleware_1.verifyToken, middleware_1.isTaskMember, async (req, res) => {
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
router.put('/:taskId/subtasks/:subtaskId', middleware_1.verifyToken, middleware_1.isTaskMember, async (req, res) => {
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
router.delete('/:taskId/subtasks/:subtaskId', middleware_1.verifyToken, middleware_1.isTaskMember, async (req, res) => {
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
