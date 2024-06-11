import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import cors from 'cors';
import dotenvFlow from 'dotenv-flow';
import swaggerJsdoc from 'swagger-jsdoc';

// Import routes
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import listRoutes from './routes/list.routes'; 
import authRoutes from './routes/user.routes';

dotenvFlow.config(); // Load environment variables

const app = express();

// Middleware setup for CORS
app.use(cors({
  origin: "*", // Allow requests from any origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed methods
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,auth-token" // Allowed headers
}));

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Swagger setup
const swaggerDefinition = yaml.load("./swagger.yaml");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MENtell Trello/Kanban-like API",
      description: "A Project Managemetnt API using Node.js, Express, MongoDB and TypeScript. Combines best worlds of Trello and Kababan",
      version: "1.0.0",
      contact: {
        name: "Noga Vigdor",
        email: "noga.vigdor@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:4000/api",
      },
      {
        url: "https://mevntello-backend.onrender.com//api",
      },
    ],
    ...swaggerDefinition,
  },
  apis: ["./src/routes/*.ts", "./src/server.ts"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));



// Welcome route
app.get("/api/welcome", (req: Request, res: Response) => {
  res.status(200).send({
    message: "Welcome to the MENtell Trello/Kanban-like API!",
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.DBHOST as string, {
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected successfully to MongoDB");

    // Start the server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => console.log("Error connecting to MongoDB: " + error));

// Use routes
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/lists", listRoutes); 
app.use("/api/users", authRoutes);

// Handle 404 errors
app.use("/", (req: Request, res: Response) => {
  res.status(404).send({ message: "Page not found" });
});

export default app;
