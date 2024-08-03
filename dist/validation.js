"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskTemplateUpdateValidation = exports.taskTemplateValidation = exports.SubTaskUpdateValidation = exports.subTaskValidation = exports.listUpdateValidation = exports.projectUpdateValidation = exports.taskUpdateValidation = exports.taskValidation = exports.listValidation = exports.projectValidation = exports.loginValidation = exports.registerValidation = void 0;
const joi_1 = __importDefault(require("joi"));
// Project Validation Schema
const projectValidation = (data) => {
    const schema = joi_1.default.object({
        _id: joi_1.default.string().optional(),
        name: joi_1.default.string().required().max(255),
        description: joi_1.default.string().allow('').max(1000),
        startDate: joi_1.default.date().required(),
        endDate: joi_1.default.date().required(),
        allocatedHours: joi_1.default.number().required().min(0),
        creator: joi_1.default.string().required(),
        teamMembers: joi_1.default.array().items(joi_1.default.object({
            _id: joi_1.default.string().required(),
            role: joi_1.default.string().valid('leader', 'member').required()
        })).min(1),
        lists: joi_1.default.array().items(joi_1.default.string()).optional(),
        createdAt: joi_1.default.date().optional(),
        updatedAt: joi_1.default.date().optional()
    });
    return schema.validate(data);
};
exports.projectValidation = projectValidation;
// Project Update Validation Schema
const projectUpdateValidation = (data) => {
    const schema = joi_1.default.object({
        _id: joi_1.default.string().optional(),
        name: joi_1.default.string().optional().max(255),
        description: joi_1.default.string().allow('').max(1000),
        startDate: joi_1.default.date().optional(),
        endDate: joi_1.default.date().optional(),
        allocatedHours: joi_1.default.number().optional().min(0),
        creator: joi_1.default.string().optional(),
        teamMembers: joi_1.default.array().items(joi_1.default.object({
            _id: joi_1.default.string().required(),
            role: joi_1.default.string().valid('leader', 'member').required()
        })).min(1).optional(),
        lists: joi_1.default.array().items(joi_1.default.string()).optional(),
        createdAt: joi_1.default.date().optional(),
        updatedAt: joi_1.default.date().optional()
    }).min(1);
    return schema.validate(data);
};
exports.projectUpdateValidation = projectUpdateValidation;
// List Validation Schema
const listValidation = (data) => {
    const schema = joi_1.default.object({
        _id: joi_1.default.string().optional(),
        name: joi_1.default.string().required().max(255),
        projectId: joi_1.default.string().required(),
        tasks: joi_1.default.array(),
        createdAt: joi_1.default.date().optional(),
        updatedAt: joi_1.default.date().optional()
    });
    return schema.validate(data);
};
exports.listValidation = listValidation;
// List Update Validation Schema
const listUpdateValidation = (data) => {
    const schema = joi_1.default.object({
        _id: joi_1.default.string().optional(),
        name: joi_1.default.string().optional().max(255),
        projectId: joi_1.default.string().optional(),
        tasks: joi_1.default.array().optional(),
        createdAt: joi_1.default.date().optional(),
        updatedAt: joi_1.default.date().optional()
    }).min(1);
    return schema.validate(data);
};
exports.listUpdateValidation = listUpdateValidation;
// Task Validation Schema
const taskValidation = (data) => {
    const schema = joi_1.default.object({
        _id: joi_1.default.string().optional(),
        listId: joi_1.default.string().required(),
        name: joi_1.default.string().required().max(255),
        description: joi_1.default.string().required().max(255),
        assignedMembers: joi_1.default.array().items(joi_1.default.object({
            _id: joi_1.default.string().required(),
            username: joi_1.default.string().required(),
            role: joi_1.default.string().valid('leader', 'member').required(),
        })).min(1),
        hoursAllocated: joi_1.default.number().required().min(0),
        hoursUsed: joi_1.default.number().required().min(0),
        status: joi_1.default.string().valid('todo', 'inProgress', 'done').required(),
        subTasks: joi_1.default.array().items(joi_1.default.object({
            name: joi_1.default.string().required(),
            completed: joi_1.default.boolean().required()
        })),
        createdAt: joi_1.default.date().optional(),
        updatedAt: joi_1.default.date().optional()
    });
    return schema.validate(data);
};
exports.taskValidation = taskValidation;
// Task Update Validation Schema
const taskUpdateValidation = (data) => {
    const schema = joi_1.default.object({
        _id: joi_1.default.string().optional(),
        listId: joi_1.default.string().optional(),
        name: joi_1.default.string().optional().max(255),
        description: joi_1.default.string().optional().max(255),
        assignedMembers: joi_1.default.array().items(joi_1.default.object({
            _id: joi_1.default.string().required(),
            username: joi_1.default.string().required(),
            role: joi_1.default.string().valid('leader', 'member').required(),
        })).optional(),
        hoursAllocated: joi_1.default.number().optional().min(0),
        hoursUsed: joi_1.default.number().optional().min(0),
        status: joi_1.default.string().valid('todo', 'inProgress', 'done').optional(),
        subTasks: joi_1.default.array().items(joi_1.default.object({
            name: joi_1.default.string().required(),
            completed: joi_1.default.boolean().required()
        })).optional(),
        createdAt: joi_1.default.date().optional(),
        updatedAt: joi_1.default.date().optional()
    }).min(1);
    return schema.validate(data);
};
exports.taskUpdateValidation = taskUpdateValidation;
// SubTask Validation Schema
const subTaskValidation = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        completed: joi_1.default.boolean().required()
    });
    return schema.validate(data);
};
exports.subTaskValidation = subTaskValidation;
// SubTask Update Validation Schema
const SubTaskUpdateValidation = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().optional(),
        completed: joi_1.default.boolean().optional()
    });
    return schema.validate(data);
};
exports.SubTaskUpdateValidation = SubTaskUpdateValidation;
// Registration Validation Schema
const registerValidation = (data) => {
    const schema = joi_1.default.object({
        _id: joi_1.default.string().optional(),
        username: joi_1.default.string().min(6).max(255).required(),
        email: joi_1.default.string().min(6).max(255).required().email(),
        password: joi_1.default.string().min(6).max(255).required()
    });
    return schema.validate(data);
};
exports.registerValidation = registerValidation;
// Login Validation Schema
const loginValidation = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().min(6).max(255).required().email(),
        password: joi_1.default.string().min(6).max(255).required()
    });
    return schema.validate(data);
};
exports.loginValidation = loginValidation;
// Task Template Validation Schema
const taskTemplateValidation = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required().min(6).max(255),
        lists: joi_1.default.array().items(joi_1.default.object({
            name: joi_1.default.string().required(),
            tasks: joi_1.default.array().items(joi_1.default.object({
                name: joi_1.default.string().required(),
            })).required(),
        })).required(),
    });
    return schema.validate(data);
};
exports.taskTemplateValidation = taskTemplateValidation;
// Task Template Update Validation Schema
const taskTemplateUpdateValidation = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().min(6).max(255).optional(),
        lists: joi_1.default.array().items(joi_1.default.object({
            name: joi_1.default.string().required(),
            tasks: joi_1.default.array().items(joi_1.default.object({
                name: joi_1.default.string().required(),
            })).required(),
        })).optional(),
    }).min(1);
    return schema.validate(data);
};
exports.taskTemplateUpdateValidation = taskTemplateUpdateValidation;
