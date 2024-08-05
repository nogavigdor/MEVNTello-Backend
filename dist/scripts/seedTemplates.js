"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const taskTemplate_1 = __importDefault(require("../models/taskTemplate"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const templates = [
    {
        name: 'Software Development',
        lists: [
            {
                name: 'To Do',
                tasks: [
                    { name: 'Setup Development Environment' },
                    { name: 'Requirement Analysis' },
                ],
            },
            {
                name: 'In Progress',
                tasks: [
                    { name: 'Develop Feature A' },
                    { name: 'Develop Feature B' },
                ],
            },
            {
                name: 'Done',
                tasks: [],
            },
        ],
    },
    {
        name: 'Marketing Campaign',
        lists: [
            {
                name: 'Planning',
                tasks: [
                    { name: 'Market Research' },
                    { name: 'Budget Allocation' },
                ],
            },
            {
                name: 'Execution',
                tasks: [
                    { name: 'Launch Social Media Campaign' },
                    { name: 'Email Marketing' },
                ],
            },
            {
                name: 'Review',
                tasks: [
                    { name: 'Analyze Campaign Performance' },
                ],
            },
        ],
    },
    {
        name: 'Event Planning',
        lists: [
            {
                name: 'Preparation',
                tasks: [
                    { name: 'Venue Selection' },
                    { name: 'Invite Guests' },
                ],
            },
            {
                name: 'Execution',
                tasks: [
                    { name: 'Event Setup' },
                    { name: 'Manage Event' },
                ],
            },
            {
                name: 'Follow-up',
                tasks: [
                    { name: 'Send Thank You Notes' },
                    { name: 'Collect Feedback' },
                ],
            },
        ],
    },
];
async function seedTemplates() {
    try {
        await mongoose_1.default.connect(process.env.DBHOST, {
        //useNewUrlParser: true,
        // useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
        // Clear the collection first
        await taskTemplate_1.default.deleteMany({});
        console.log('Cleared existing templates');
        const result = await taskTemplate_1.default.insertMany(templates);
        console.log('Templates seeded successfully:', result);
    }
    catch (err) {
        console.error('Error seeding templates:', err);
    }
    finally {
        mongoose_1.default.disconnect();
    }
}
seedTemplates();
