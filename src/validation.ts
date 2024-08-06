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
import SubTaskDocument from './interfaces/ISubTask';
import { UserDocument } from './interfaces/IUser';
import { UserPayload } from './interfaces/IUserPayload';
import { CustomRequest } from './interfaces/ICustomRequest';
import { TaskTemplateDocument } from './interfaces/ITaskTemplate';

// Project Validation Schema
const projectValidation = (data: ProjectDocument) => {
    const schema = Joi.object({
        _id: Joi.string().optional(), 
        creationStatus: Joi.string().valid('tasks', 'management', 'complete').optional(),
        selectedTemplate: Joi.string().optional(),
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

// Project Update Validation Schema
const projectUpdateValidation = (data: Partial<ProjectDocument>) => {
    const schema = Joi.object({
        _id: Joi.string().optional(), 
        name: Joi.string().optional().max(255),
        description: Joi.string().allow('').max(1000),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        allocatedHours: Joi.number().optional().min(0),
        creator: Joi.string().optional(),
        teamMembers: Joi.array().items(
            Joi.object({
                _id: Joi.string().required(),
                role: Joi.string().valid('leader', 'member').required()
            })
        ).min(1).optional(),
        lists : Joi.array().items(Joi.string()).optional(),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional()
    }).min(1);

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

// List Update Validation Schema
const listUpdateValidation = (data: Partial<ListDocument>) => {
    const schema = Joi.object({
        _id: Joi.string().optional(), 
        name: Joi.string().optional().max(255),
        projectId: Joi.string().optional(),
        tasks: Joi.array().optional(),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional()
    }).min(1);

    return schema.validate(data);
}

// Task Validation Schema
const taskValidation = (data: TaskDocument) => {
    const schema = Joi.object({
        _id: Joi.string().optional(), 
        listId: Joi.string().required(),
        name: Joi.string().required().max(255),
        description: Joi.string().optional().max(255),
        assignedMembers: Joi.array().items(
            Joi.object({
              _id: Joi.string().required(),
              username: Joi.string().required(),
              role: Joi.string().valid('leader', 'member').required(),
              allocatedHours: Joi.number().required().min(0),
              hoursUsed: Joi.number().required().min(0),
            }),
          ).min(0),
        hoursAllocated: Joi.number().default(0).min(0),
        hoursUsed: Joi.number().default(0).min(0),
        status: Joi.string().valid('todo', 'inProgress', 'done').default("todo"),
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

// Task Update Validation Schema
const taskUpdateValidation = (data: Partial<TaskDocument>) => {
    const schema = Joi.object({
        _id: Joi.string().optional(), 
        listId: Joi.string().optional(),
        name: Joi.string().optional().max(255),
        description: Joi.string().optional().max(255),
        assignedMembers: Joi.array().items(
            Joi.object({
              _id: Joi.string().required(),
              username: Joi.string().required(),
              role: Joi.string().valid('leader', 'member').required(),
            })
        ).optional(),
        hoursAllocated: Joi.number().optional().min(0),
        hoursUsed: Joi.number().optional().min(0),
        status: Joi.string().valid('todo', 'inProgress', 'done').optional(),
        subTasks: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                completed: Joi.boolean().required()
            })
        ).optional(),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional()
    }).min(1);
    return schema.validate(data);
};

// SubTask Validation Schema
const subTaskValidation = (data: { data: SubTaskDocument}) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        completed: Joi.boolean().required()
    });
    return schema.validate(data);
}

// SubTask Update Validation Schema
const SubTaskUpdateValidation = (data: { data: Partial<SubTaskDocument>}) => {
    const schema = Joi.object({
        name: Joi.string().optional(),
        completed: Joi.boolean().optional()
    });
    return schema.validate(data);
}

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

// Task Template Validation Schema
const taskTemplateValidation = (data: TaskTemplateDocument) => {
    const schema = Joi.object({
        name: Joi.string().required().min(6).max(255),
        lists: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                tasks: Joi.array().items(
                    Joi.object({
                        name: Joi.string().required(),
                    })
                ).required(),
            })
        ).required(),
    });
    return schema.validate(data);
};

// Task Template Update Validation Schema
const taskTemplateUpdateValidation = (data: Partial<TaskTemplateDocument>) => {
    const schema = Joi.object({
        name: Joi.string().min(6).max(255).optional(),
        lists: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                tasks: Joi.array().items(
                    Joi.object({
                        name: Joi.string().required(),
                    })
                ).required(),
            })
        ).optional(),
    }).min(1);
    return schema.validate(data);
};
  

export { registerValidation, loginValidation, projectValidation,
     listValidation, taskValidation, taskUpdateValidation,
     projectUpdateValidation, listUpdateValidation, subTaskValidation, SubTaskUpdateValidation, 
     taskTemplateValidation, taskTemplateUpdateValidation };
