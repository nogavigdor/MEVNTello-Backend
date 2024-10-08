"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const cors_1 = __importDefault(require("cors"));
const dotenv_flow_1 = __importDefault(require("dotenv-flow"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
// Import routes
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const list_routes_1 = __importDefault(require("./routes/list.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const taskTemplate_routes_1 = __importDefault(require("./routes/taskTemplate.routes"));
dotenv_flow_1.default.config(); // Load environment variables
const app = (0, express_1.default)();
// Middleware setup for CORS
app.use((0, cors_1.default)({
    origin: "*", // Allow requests from any origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed methods
    allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,auth-token" // Allowed headers
}));
// Middleware for parsing JSON bodies
app.use(body_parser_1.default.json());
// Global request logger
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.originalUrl}`);
    next();
});
// Swagger setup
const swaggerDefinition = yamljs_1.default.load("./swagger.yaml");
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MEVNtell Trello/Kanban-like API",
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
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
// Welcome route
app.get("/api/welcome", (req, res) => {
    res.status(200).send({
        message: "Welcome to the MENtell Trello/Kanban-like API!",
    });
});
// Connect to MongoDB
mongoose_1.default
    .connect(process.env.DBHOST, {
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
app.use("/api/projects", project_routes_1.default);
app.use('/api/tasks/templates', taskTemplate_routes_1.default);
app.use("/api/tasks", task_routes_1.default);
app.use("/api/lists", list_routes_1.default);
app.use("/api/users", user_routes_1.default);
// Handle 404 errors
app.use("/", (req, res) => {
    res.status(404).send({ message: "Page not found" });
});
exports.default = app;
