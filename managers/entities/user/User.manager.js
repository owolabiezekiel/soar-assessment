const User = require('./User.model');
const bcrypt = require('bcrypt-nodejs');

module.exports = class UserManager {
    constructor({ config, managers }) {
        this.config = config;
        this.tokenManager = managers.token;
    }

    async createUser(req, res) {
        try {
            const { username, email, password, role, schoolId } = req.body;

            // Basic validation
            if (!username || !email || !password) {
                return res.status(400).json({ ok: false, error: 'Missing fields' });
            }

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ ok: false, error: 'User already exists' });
            }

            const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            const user = new User({ username, email, password: hashedPassword, role, schoolId });
            await user.save();

            const token = this.tokenManager.genLongToken({ userId: user._id, role: user.role });

            return res.status(201).json({ ok: true, data: { user, token } });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ ok: false, error: err.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

            const token = this.tokenManager.genLongToken({ userId: user._id, role: user.role, schoolId: user.schoolId });
            return res.status(200).json({ ok: true, data: { token, user } });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ ok: false, error: err.message });
        }
    }
}
