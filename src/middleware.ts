
import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import User from './models/user';
import Project from './models/project';
import Task from './models/task';
import { UserPayload } from './interfaces/IUserPayload';
import { CustomRequest } from './interfaces/ICustomRequest';


// Token Verification Middleware
const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET as string) as UserPayload;
        //attaches the user data to the request object
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

//check if the user is an admin
const isAdmin: RequestHandler = async (req, res, next) => {

    //find the user by id
    const user = await User.findById((req as CustomRequest).user._id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.role === 'admin') {
        return next(); // If the user is admin, skip the next middleware
      }

    next();
};

// Check if the user is a  leader - when project id is a parameter or in the request body
const isLeader: RequestHandler = async (req, res, next) => {
    const projectId = req.params.id || req.body.projectId; 

    if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
    }


    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    //checks if the user is a leader
    const isLeader = project.teamMembers.some(member => member._id.toString() === (req as CustomRequest).user._id && member.role === 'leader');

    if (!isLeader) {
        return res.status(403).json({ message: 'Access Denied: You are not the leader of this project' });
    }

    next();
};

// Check if the user is a team member (and not a leader) - only for project routes
const isProjectMember: RequestHandler = async (req, res, next) => {
    const projectId = req.params.id || req.body.projectId; 

    if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    //checks if the user is a member
    const isMember = project.teamMembers.some(member => member._id.toString() === (req as CustomRequest).user._id && member.role === 'member');

    if (!isMember) {
        return res.status(403).json({ message: 'Access Denied: You are not a team member of this project' });
    }

    next();
};

// Check if the user is a team member or leader (only for project routes)
const isMemberOrLeader: RequestHandler = async (req, res, next) => {
    const customReq = req as CustomRequest;

    // First, allow admins to bypass the check
    if (customReq.user.role === 'admin') {
        return next();
    }

    const projectId = req.params.id || req.body.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }

    // Check if the user is a member or leader
    const isMemberOrLeader = project.teamMembers.some(member => member._id.toString() === customReq.user._id);

    if (!isMemberOrLeader) {
        return res.status(403).json({ message: 'Access Denied: You are not a team member of this project' });
    }

    next();
};

//Checks if the user is task member
const isTaskMember: RequestHandler = async (req, res, next) => {
    const taskId = req.params.id || req.body.taskId; 
    const task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    const isMember = task.assignedMembers.some(member => member.toString() === (req as CustomRequest).user._id);

    if (!isMember) {
        return res.status(403).json({ message: 'Access Denied: You are not a team member of this task' });
    }

    next();
};

export { verifyToken, isAdmin, isLeader, isProjectMember, isMemberOrLeader, isTaskMember};