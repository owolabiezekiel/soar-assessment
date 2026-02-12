const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    grade: { type: String, required: true },
    capacity: { type: Number, default: 30 },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    resources: [{ type: String }], // e.g., ["Projector", "Whiteboard"]
}, { timestamps: true });

module.exports = mongoose.model('Classroom', ClassroomSchema);
