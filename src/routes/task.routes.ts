import express from 'express';
import { Types } from 'mongoose';
import { verifyToken, isLeader, isAdmin, isTaskMember } from '../middleware';
import { taskValidation } from '../validation';
import Task from '../models/task';
import List from '../models/list';
import { RequestHandler } from 'express';
import  ISubTask  from '../interfaces/ISubTask';
import Project from '../models/project';
import User from '../models/user';
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

// Get all tasks for a specific list (id is the list ID) -all project memebers can see the tasks
router.get('/list/:id', verifyToken as RequestHandler, async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const customReq = req as CustomRequest;
        const userId = customReq.user._id;
        const isAdmin = customReq.user.role === 'admin';

        const projectId = list.projectId;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check if the user is a member or leader of the project
        const isMemberOrLeader = project.teamMembers.some(member => member._id.toString() === userId);
        if (!isAdmin && !isMemberOrLeader) {
            return res.status(403).json({ message: 'Access Denied: You are not a team member of this project' });
        }

        const tasks = await Task.find({ listId: req.params.id });

        // If no tasks are found, return an empty array with a 200 status
        if (!tasks || tasks.length === 0) {
            return res.status(200).json([]);
        }

        res.json(tasks);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});


// Create a new task (only by project leaders or admins)
router.post('/:listId', verifyToken as RequestHandler, isAdmin, async (req, res, next) => {
    const customReq = req as CustomRequest;
    const listId = req.params.listId;

    try {
        const list = await List.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const project = await Project.findById(list.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        //checks if the user is a member or leader
        const isLeader = project.teamMembers.some(member => member.role === 'leader' && member._id.toString() === customReq.user._id);

        if (!isLeader) {
            return res.status(403).json({ message: 'Access Denied: You are not the leader of this project' });
        }

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

/// Update a task - id is the task ID, only task members can update hoursUsed, other updates are allowed only for the project leader or admin
router.put('/:id', verifyToken as RequestHandler, async (req, res) => {
    const customReq = req as CustomRequest;
    const { error } = taskValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const list = await List.findById(task.listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const project = await Project.findById(list.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const userId = customReq.user._id;

        // Check if the user is an admin
        const isAdmin = customReq.user.role === 'admin';

        // Check if the user is a project leader
        const isLeader = project.teamMembers.some(member => member._id.toString() === userId.toString() && member.role === 'leader');

        // Check if the user is an assigned member of the task
        const isTaskMember = task.assignedMembers.some(memberId => memberId.toString() === userId.toString());

        // If the user is a project leader or admin, allow all updates
        if (isAdmin || isLeader) {
            const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedTask) return res.status(404).json({ message: "Task not found" });
            return res.json(updatedTask);
        }

        // If the request body only contains hoursUsed, allow task members to update
        if (Object.keys(req.body).length === 1 && 'hoursUsed' in req.body && isTaskMember) {
            const updatedTask = await Task.findByIdAndUpdate(req.params.id, { hoursUsed: req.body.hoursUsed }, { new: true });
            if (!updatedTask) return res.status(404).json({ message: "Task not found" });
            return res.json(updatedTask);
        }

        return res.status(403).json({ message: 'Access denied. Only project leaders, admins, or task members can update hoursUsed.' });

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

        const project = await Project.findById(list.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Check if the user is an admin
        const isAdmin = customReq.user.role === 'admin';

        // Check if the user is a project leader
        const isLeader = project.teamMembers.some(member => member._id.toString() === customReq.user._id && member.role === 'leader');

        //only admin or a project leader can delete a task
        if (!isAdmin && !isLeader) {
            return res.status(403).json({ message: 'Access Denied: You are not authorized to delete this task' });
        }

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