"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/taskTemplate.ts
const mongoose_1 = require("mongoose");
// Task Template schema to enable creating auto task templates for projects
const taskTemplateSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
    },
    lists: [
        {
            name: {
                type: String,
                required: true,
            },
            tasks: [
                {
                    name: {
                        type: String,
                        required: true,
                    },
                    description: {
                        type: String,
                    },
                },
            ],
        },
    ],
}, {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields
});
exports.default = (0, mongoose_1.model)('TaskTemplate', taskTemplateSchema);
