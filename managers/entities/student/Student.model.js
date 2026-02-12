const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
    transferHistory: [{
        fromSchoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
        toSchoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
