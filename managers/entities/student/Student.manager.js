const Student = require('./Student.model');

module.exports = class StudentManager {
    constructor({ config, managers }) {
        this.config = config;
        this.managers = managers;
    }

    async create(req, res) {
        try {
            const { name, age, classroomId } = req.body;
            const { schoolId, role } = req.user;

            if (role !== 'SCHOOL_ADMIN' && role !== 'SUPERADMIN') {
                return res.status(403).json({ ok: false, error: 'Forbidden' });
            }
            if (!schoolId && role === 'SCHOOL_ADMIN') {
                return res.status(400).json({ ok: false, error: 'User not associated with a school' });
            }

            const targetSchoolId = schoolId || req.body.schoolId;

            const student = new Student({
                name,
                age,
                classroomId,
                schoolId: targetSchoolId
            });
            await student.save();

            return res.status(201).json({ ok: true, data: student });
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
            } else if (req.query.schoolId) {
                query.schoolId = req.query.schoolId;
            }

            const students = await Student.find(query).populate('classroomId');
            return res.status(200).json({ ok: true, data: students });
        } catch (err) {
            return res.status(500).json({ ok: false, error: err.message });
        }
    }
}
