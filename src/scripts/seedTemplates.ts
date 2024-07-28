// src/scripts/seedTemplates.ts
import mongoose from 'mongoose';
import TaskTemplate from '../models/taskTemplate';
import { env } from 'process';

// Sample task templates to seed the database
const templates = [
  {
    name: 'Software Development',
    lists: [
      {
        name: 'Backlog',
        tasks: [
          { name: 'Setup Development Environment', description: 'Install necessary tools and frameworks.' },
          { name: 'Requirement Analysis', description: 'Gather and analyze project requirements.' },
        ],
      },
      {
        name: 'In Progress',
        tasks: [
          { name: 'Develop Feature A', description: 'Implement and test feature A.' },
          { name: 'Develop Feature B', description: 'Implement and test feature B.' },
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
          { name: 'Market Research', description: 'Conduct research on the target market.' },
          { name: 'Budget Allocation', description: 'Allocate budget for various marketing activities.' },
        ],
      },
      {
        name: 'Execution',
        tasks: [
          { name: 'Launch Social Media Campaign', description: 'Create and publish social media posts.' },
          { name: 'Email Marketing', description: 'Send marketing emails to potential customers.' },
        ],
      },
      {
        name: 'Review',
        tasks: [
          { name: 'Analyze Campaign Performance', description: 'Review the performance metrics of the campaign.' },
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
          { name: 'Venue Selection', description: 'Select a venue for the event.' },
          { name: 'Invite Guests', description: 'Send out invitations to guests.' },
        ],
      },
      {
        name: 'Execution',
        tasks: [
          { name: 'Event Setup', description: 'Set up the venue for the event.' },
          { name: 'Manage Event', description: 'Ensure everything runs smoothly during the event.' },
        ],
      },
      {
        name: 'Follow-up',
        tasks: [
          { name: 'Send Thank You Notes', description: 'Send thank you notes to attendees.' },
          { name: 'Collect Feedback', description: 'Collect feedback from attendees.' },
        ],
      },
    ],
  },
];

async function seedTemplates() {
  await mongoose.connect(env.MONGODB_URI as string);
  await TaskTemplate.insertMany(templates);
  console.log('Templates seeded successfully');
  mongoose.disconnect();
}

seedTemplates();