const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['SUPERADMIN', 'SCHOOL_ADMIN'], default: 'SCHOOL_ADMIN' },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }, // For school admins
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
