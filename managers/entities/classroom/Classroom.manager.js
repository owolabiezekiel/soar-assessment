const Classroom = require('./Classroom.model');

module.exports = class ClassroomManager {
    constructor({ config, managers }) {
        this.config = config;
        this.managers = managers;
    }

    async create(req, res) {
        try {
            const { name, grade, capacity, resources } = req.body;
            const { schoolId, role } = req.user;

            if (role !== 'SCHOOL_ADMIN' && role !== 'SUPERADMIN') {
                return res.status(403).json({ ok: false, error: 'Forbidden' });
            }
            if (!schoolId && role === 'SCHOOL_ADMIN') {
                return res.status(400).json({ ok: false, error: 'User not associated with a school' });
            }

            // Superadmins might need to specify schoolId in body? 
            // The requirement says Classrooms are managed by school administrators. 
            // Let's enforce School Admin for now, or use body schoolId for Superadmin.
            const targetSchoolId = schoolId || req.body.schoolId;

            const classroom = new Classroom({
                name,
                grade,
                capacity,
                resources,
                schoolId: targetSchoolId
            });
            await classroom.save();

            return res.status(201).json({ ok: true, data: classroom });
        } catch (err) {
            return res.status(500).json({ ok: false, error: err.message });
        }
    }

    async list(req, res) {
        try {
            const { schoolId, role } = req.user;
            let query = {};
            if (role === 'SCHOOL_ADMIN') {
                query.schoolId = schoolId;
            }
            // Superadmin sees all or can filter? Let's show all or filter by query
            if (req.query.schoolId) query.schoolId = req.query.schoolId;

            const classrooms = await Classroom.find(query);
            return res.status(200).json({ ok: true, data: classrooms });
        } catch (err) {
            return res.status(500).json({ ok: false, error: err.message });
        }
    }
}
