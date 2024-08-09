"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const taskTemplate_1 = __importDefault(require("../models/taskTemplate"));
//dotenv.config();
// Load the .env.production file
// Load the .env.production file
//dotenv.config({ path: '../.env.production' });
const templates = [
    {
        name: 'Software Development',
        lists: [
            {
                name: 'Planning',
                tasks: [
                    { name: 'Setup Development Environment' },
                    { name: 'Requirement Analysis' },
                ],
            },
            {
                name: 'Development',
                tasks: [
                    { name: 'Develop Feature A' },
                    { name: 'Develop Feature B' },
                ],
            },
            {
                name: 'Testing',
                tasks: [
                    { name: 'Unit Tests' },
                    { name: 'Integration Tests' },
                ],
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
const DBHOST = 'mongodb+srv://nogavigdor:Easv365@cluster0.4lslicv.mongodb.net/mevntello_db_prod?retryWrites=true&w=majority';
async function seedTemplates() {
    try {
        await mongoose_1.default.connect(DBHOST, {
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
