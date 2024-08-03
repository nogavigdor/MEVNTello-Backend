"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const taskTemplate_1 = __importDefault(require("../models/taskTemplate"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI is not defined in the environment variables');
        process.exit(1); // Exit the process with an error
    }
    try {
        await mongoose_1.default.connect(mongoUri);
        await taskTemplate_1.default.insertMany(templates);
        console.log('Templates seeded successfully');
    }
    catch (err) {
        console.error('Error seeding templates:', err);
    }
    finally {
        mongoose_1.default.disconnect();
    }
}
seedTemplates();
