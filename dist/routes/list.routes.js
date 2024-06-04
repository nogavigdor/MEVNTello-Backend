"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_1 = require("../validation");
const list_1 = __importDefault(require("../models/list"));
const validation_2 = require("../validation");
const router = express_1.default.Router();
// Get all lists
router.get('/', validation_1.verifyToken, async (req, res) => {
    try {
        const lists = await list_1.default.find();
        res.json(lists);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Get a specific list
router.get('/:id', validation_1.verifyToken, async (req, res) => {
    try {
        const list = await list_1.default.findById(req.params.id);
        if (!list)
            return res.status(404).json({ message: "List not found" });
        res.json(list);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Create a new list
router.post('/', validation_1.verifyToken, async (req, res) => {
    const { error } = (0, validation_2.listValidation)(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    const list = new list_1.default(req.body);
    try {
        const savedList = await list.save();
        res.status(201).json(savedList);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Update a list
router.put('/:id', validation_1.verifyToken, async (req, res) => {
    const { error } = (0, validation_2.listValidation)(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });
    try {
        const updatedList = await list_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedList)
            return res.status(404).json({ message: "List not found" });
        res.json(updatedList);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Delete a list
router.delete('/:id', validation_1.verifyToken, async (req, res) => {
    try {
        const removedList = await list_1.default.findByIdAndDelete(req.params.id);
        if (!removedList)
            return res.status(404).json({ message: "List not found" });
        res.json({ message: "List deleted" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = router;
