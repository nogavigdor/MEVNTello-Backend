"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskSchema = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const subTaskSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, default: () => new mongoose_2.Types.ObjectId() },
    name: { type: String, required: true },
    completed: { type: Boolean, required: true, default: false },
});
const teamMemberSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    role: { type: String, enum: ["leader", "member"], required: true },
});
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
    assignedMembers: [teamMemberSchema],
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
    subTasks: [subTaskSchema],
}, {
    timestamps: true, // This correctly adds `createdAt` and `updatedAt` fields
});
exports.default = (0, mongoose_1.model)("Task", exports.taskSchema);
