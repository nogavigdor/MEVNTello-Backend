"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const listSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    tasks: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Task',
        },
    ],
}, {
    timestamps: true, // This correctly adds `createdAt` and `updatedAt` fields
});
exports.default = (0, mongoose_1.model)('List', listSchema);
