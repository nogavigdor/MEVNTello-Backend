import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ProjectDocument } from './interfaces/IProject';
import { ListDocument } from './interfaces/IList';
import { TaskDocument } from './interfaces/ITask';
import { UserDocument } from './interfaces/IUser';
import { UserPayload } from './interfaces/IUserPayload';
// Project Validation Schema
const projectValidation = (data: ProjectDocument) => {
    const schema = Joi.object({
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
        lists: Joi.array().items(
            Joi.string().required()
        ).min(1),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional()
    });
 
    return schema.validate(data);
};

// List Validation Schema
const listValidation = (data: ListDocument) => {
    const schema = Joi.object({
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
        name: Joi.string().min(6).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
    });
    return schema.validate(data);
};

// Login Validation Schema
const loginValidation = (data: UserDocument) => {
    const schema = Joi.object({
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
    });
    return schema.validate(data);
};

// Token Verification Middleware
interface CustomRequest extends Request {
    user: UserPayload;
}

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET as string) as UserPayload;
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

export { registerValidation, loginValidation, verifyToken, projectValidation, listValidation, taskValidation };
