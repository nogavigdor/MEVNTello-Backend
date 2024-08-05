"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const projectSchema = new mongoose_1.Schema({
    creationStatus: {
        type: String,
        enum: ['tasks', 'management', 'complete'],
        required: true,
    },
    selectedTemplate: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TaskTemplate',
    },
    name: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
    },
    description: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    allocatedHours: {
        type: Number,
        required: true,
        min: 0,
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    teamMembers: [
        {
            _id: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            role: {
                type: String,
                enum: ['leader', 'member'],
                required: true,
            },
        },
    ],
    lists: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'List' }],
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)("Project", projectSchema);
