import express from 'express';
import { Types } from 'mongoose';
import { verifyToken, isLeader, isTaskMember, taskValidation } from '../validation';
import Task from '../models/task';
import List from '../models/list';
import { RequestHandler } from 'express';
import  ISubTask  from '../interfaces/ISubTask';
import { CustomRequest } from '../interfaces/ICustomRequest';

const router = express.Router();


// Get all tasks assigned to the authenticated user
router.get('/', verifyToken as RequestHandler, async (req, res) => {
    const customReq = req as CustomRequest;
    try {
        const tasks = await Task.find({ assignedMembers: customReq.user._id });
        res.json(tasks);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

// Create a new task (only by leaders)
router.post('/:listId', verifyToken as RequestHandler, async (req, res, next) => {
    const customReq = req as CustomRequest;
    const listId = req.params.listId;

    try {
        const list = await List.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        // Add projectId to the body for isLeader middleware
        req.body.projectId = list.projectId;

        // Verify if the user is a leader of the project
        await isLeader(req, res, next);

        const { error } = taskValidation(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const task = new Task({
            ...req.body,
            listId: listId
        });

        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
});

// Update a task - id is the task ID, only task members can update hoursUsed, other updates are allowed only for the leader
router.put('/:id', verifyToken as RequestHandler, async (req, res, next) => {
    const customReq = req as CustomRequest;
    const { error } = taskValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const list = await List.findById(task.listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        // Add projectId to the body for isLeader middleware
        req.body.projectId = list.projectId;

        // Check if the update includes hoursUsed
        if ('hoursUsed' in req.body) {
            // Only task members can update hoursUsed
            await isTaskMember(req, res, async () => {
                try {
                    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
                    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
                    res.json(updatedTask);
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        res.status(400).json({ message: err.message });
                    } else {
                        res.status(400).json({ message: 'An unknown error occurred' });
                    }
                }
            });
        } else {
            // Other updates are allowed only for the leader
            await isLeader(req, res, async () => {
                try {
                    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
                    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
                    res.json(updatedTask);
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        res.status(400).json({ message: err.message });
                    } else {
                        res.status(400).json({ message: 'An unknown error occurred' });
                    }
                }
            });
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

// Delete a task
router.delete('/:id', verifyToken as RequestHandler, async (req, res, next) => {
    const customReq = req as CustomRequest;

    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const list = await List.findById(task.listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        // Add projectId to the body for isLeader middleware
        req.body.projectId = list.projectId;
        await isLeader(req, res, next);

        const removedTask = await Task.findByIdAndDelete(req.params.id);
        if (!removedTask) return res.status(404).json({ message: "Task not found" });
        res.json({ message: "Task deleted" });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

// CRUD operations for subtasks

// Create a new subtask
router.post('/:taskId/subtasks', verifyToken as RequestHandler, isTaskMember, async (req, res) => {
    const { taskId } = req.params;
    const { name, completed } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const subTask: ISubTask = { _id: new Types.ObjectId(), name, completed: completed || false };
        task.subTasks.push(subTask);
        await task.save();

        res.status(201).json(subTask);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
});

// Read all subtasks
router.get('/:taskId/subtasks', verifyToken as RequestHandler, isTaskMember, async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        res.json(task.subTasks);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

// Update a subtask
router.put('/:taskId/subtasks/:subtaskId', verifyToken as RequestHandler, isTaskMember, async (req, res) => {
    const { taskId, subtaskId } = req.params;
    const { name, completed } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const subTask = task.subTasks.find((subtask) => subtask._id.toString() === subtaskId);
        if (!subTask) return res.status(404).json({ message: "Subtask not found" });

        if (name !== undefined) subTask.name = name;
        if (completed !== undefined) subTask.completed = completed;
        await task.save();

        res.json(subTask);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
});

// Delete a subtask
router.delete('/:taskId/subtasks/:subtaskId', verifyToken as RequestHandler, isTaskMember, async (req, res) => {
    const { taskId, subtaskId } = req.params;

    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const subTaskIndex = task.subTasks.findIndex((subtask) => subtask._id.toString() === subtaskId);
        if (subTaskIndex === -1) return res.status(404).json({ message: "Subtask not found" });

        task.subTasks.splice(subTaskIndex, 1);
        await task.save();

        res.json({ message: "Subtask deleted" });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
}
);

export default router;