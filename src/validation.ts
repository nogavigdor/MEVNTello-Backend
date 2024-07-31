import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Project from './models/project'; 
import List from './models/list';
import Task from './models/task';
import User from './models/user'; // Import the User model
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
        creator: Joi.string().required(),
        teamMembers: Joi.array().items(
            Joi.object({
                _id: Joi.string().required(),
                role: Joi.string().valid('leader', 'member').required()
            })
        ).min(1),
        lists : Joi.array().items(Joi.string()).optional(),
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
        tasks: Joi.array(),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional()
    });
    return schema.validate(data);
};

// Task Validation Schema
const taskValidation = (data: Partial<TaskDocument>) => {
    const schema = Joi.object({
        _id: Joi.string().optional(), 
        listId: Joi.string().required(),
        name: Joi.string().required().max(255),
        description: Joi.string().required().max(255),
        assignedMembers: Joi.array().items(
            Joi.object({
              _id: Joi.string().required(),
              username: Joi.string().required(),
              role: Joi.string().valid('leader', 'member').required(),
            })
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


export { registerValidation, loginValidation, projectValidation, listValidation, taskValidation };
