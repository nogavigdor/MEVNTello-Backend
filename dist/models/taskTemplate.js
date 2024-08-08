"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const taskTemplateSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
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
                },
            ],
        },
    ],
}, {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields
});
exports.default = (0, mongoose_1.model)('TaskTemplate', taskTemplateSchema);
