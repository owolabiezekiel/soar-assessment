const School = require('./School.model');
const User = require('../user/User.model');

module.exports = class SchoolManager {
    constructor({ config, managers }) {
        this.config = config;
        this.managers = managers;
    }

    // Create School (Superadmin only)
    async create(req, res) {
        try {
            const { name, address, contactEmail, adminId } = req.body;
            // TODO: Validate adminId exists and is a SCHOOL_ADMIN
            // TODO: Check Caller Role (Superadmin) - middleware should handle this? Or check here?
            // For now, let's assume middleware or check strictly here:

            // RBAC Check
            if (req.user.role !== 'SUPERADMIN') {
                return res.status(403).json({ ok: false, errors: 'Forbidden: Superadmin only' });
            }

            // Create School
            const school = new School({ name, address, contactEmail, adminId });
            await school.save();

            // Update user with schoolId if adminId is provided
            if (adminId) {
                await User.findByIdAndUpdate(adminId, { schoolId: school._id, role: 'SCHOOL_ADMIN' });
            }

            return res.status(201).json({ ok: true, data: school });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ ok: false, error: err.message });
        }
    }

    async list(req, res) {
        try {
            const schools = await School.find();
            return res.status(200).json({ ok: true, data: schools });
        } catch (err) {
            return res.status(500).json({ ok: false, error: err.message });
        }
    }
}
