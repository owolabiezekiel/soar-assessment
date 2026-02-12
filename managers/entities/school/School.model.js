const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    contactEmail: { type: String, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The school admin
}, { timestamps: true });

module.exports = mongoose.model('School', SchoolSchema);
