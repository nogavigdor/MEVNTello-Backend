import mongoose from 'mongoose';
import TaskTemplate from '../models/taskTemplate';
import * as dotenv from 'dotenv';

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
    await mongoose.connect(process.env.DBHOST as string, {
      //useNewUrlParser: true,
     // useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear the collection first
    await TaskTemplate.deleteMany({});
    console.log('Cleared existing templates');

    const result = await TaskTemplate.insertMany(templates);
    console.log('Templates seeded successfully:', result);
  } catch (err) {
    console.error('Error seeding templates:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedTemplates();
