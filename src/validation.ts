import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Project from './models/project'; 
import List from './models/list';
import Task from './models/task';
import { ProjectDocument } from './interfaces/IProject';
import { ListDocument } from './interfaces/IList';
import { TaskDocument } from './interfaces/ITask';
import { UserDocument } from './interfaces/IUser';
import { UserPayload } from './interfaces/IUserPayload';
import { CustomRequest } from './interfaces/ICustomRequest';

// Project Validation Schema
const projectValidation = (data: ProjectDocument) => {
    const schema = Joi.object({
        _id: Joi.string().optional(), 
        name: Joi.string().required().max(255),
        description: Joi.string().allow('').max(1000),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        allocatedHours: Joi.number().required().min(0),
        teamMembers: Joi.array().items(
            Joi.object({
                userId: Joi.string().required(),
                role: Joi.string().valid('leader', 'member').required()
            })
        ).min(1),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional()
    });

    return schema.validate(data);
};

// List Validation Schema
const listValidation = (data: ListDocument) => {
    const schema = Joi.object({
        _id: Joi.string().optional(), 
        name: Joi.string().required().max(255),
        projectId: Joi.string().required(),
        tasks: Joi.array().items(
            Joi.string().required()
        ).min(1),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional()
    });
    return schema.validate(data);
};

// Task Validation Schema
const taskValidation = (data: TaskDocument) => {
    const schema = Joi.object({
        _id: Joi.string().optional(), 
        listId: Joi.string().required(),
        name: Joi.string().required().max(255),
        description: Joi.string().required().max(255),
        assignedMembers: Joi.array().items(
            Joi.string().required()
        ).min(1),
        hoursAllocated: Joi.number().required().min(0),
        hoursUsed: Joi.number().required().min(0),
        status: Joi.string().valid('todo', 'inProgress', 'done').required(),
        subTasks: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                completed: Joi.boolean().required()
            })
        ),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional()
    });
    return schema.validate(data);
};

// Registration Validation Schema
const registerValidation = (data: UserDocument) => {
    const schema = Joi.object({
        _id: Joi.string().optional(), 
        username: Joi.string().min(6).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
    });
    return schema.validate(data);
};

// Login Validation Schema
const loginValidation = (data: { email: string; password: string }) => {
    const schema = Joi.object({
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
    });
    return schema.validate(data);
};

// Token Verification Middleware


const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET as string) as UserPayload;
        //attaches the user data to the request object
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

// Check if the user is a  leader
const isLeader: RequestHandler = async (req, res, next) => {
    const projectId = req.params.id || req.body.projectId; 

    if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
    }


    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    //checks if the user is a leader
    const isLeader = project.teamMembers.some(member => member.userId.toString() === (req as CustomRequest).user._id && member.role === 'leader');

    if (!isLeader) {
        return res.status(403).json({ message: 'Access Denied: You are not the leader of this project' });
    }

    next();
};

// Check if the user is a team member (and not a leader)
const isProjectMember: RequestHandler = async (req, res, next) => {
    const projectId = req.params.id || req.body.projectId; 

    if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    //checks if the user is a member
    const isMember = project.teamMembers.some(member => member.userId.toString() === (req as CustomRequest).user._id && member.role === 'member');

    if (!isMember) {
        return res.status(403).json({ message: 'Access Denied: You are not a team member of this project' });
    }

    next();
};

// Check if the user is a team member or leader
const isMemberOrLeader: RequestHandler = async (req, res, next) => {
    const projectId = req.params.id || req.body.projectId; // Adjust to ensure it checks both params and body
    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    //checks if the user is a member or leader
    const isMemberOrLeader = project.teamMembers.some(member => member.userId.toString() === (req as CustomRequest).user._id);

    if (!isMemberOrLeader) {
        return res.status(403).json({ message: 'Access Denied: You are not a team member of this project' });
    }

    next();
};

//Checks if the user is task member
const isTaskMember: RequestHandler = async (req, res, next) => {
    const taskId = req.params.id || req.body.taskId; 
    const task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    const isMember = task.assignedMembers.some(member => member.toString() === (req as CustomRequest).user._id);

    if (!isMember) {
        return res.status(403).json({ message: 'Access Denied: You are not a team member of this task' });
    }

    next();
};

export { registerValidation, loginValidation, verifyToken, projectValidation, listValidation, taskValidation, isLeader, isProjectMember, isMemberOrLeader, isTaskMember };
