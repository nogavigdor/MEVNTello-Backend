"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskSchema = void 0;
const mongoose_1 = require("mongoose");
exports.taskSchema = new mongoose_1.Schema({
    listId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "List",
        required: true,
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
    assignedMembers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    hoursAllocated: {
        type: Number,
        required: true,
        min: 0,
    },
    hoursUsed: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ["todo", "inProgress", "done"],
        required: true,
    },
    subTasks: [
        {
            name: String,
            completed: Boolean,
        },
    ], // Add a closing curly brace here
}, {
    timestamps: true, // This correctly adds `createdAt` and `updatedAt` fields
});
exports.default = (0, mongoose_1.model)("Task", exports.taskSchema);
