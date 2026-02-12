const http = require('http');
const express = require('express');
const cors = require('cors');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

module.exports = class UserServer {
    constructor({ config, managers }) {
        this.config = config;
        this.managers = managers;
        this.app = express();

        // Security Middleware
        this.app.use(helmet());

        // Rate Limiter: 100 requests per 15 minutes
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api', limiter);

        this.app.use(cors({ origin: '*' }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    run() {
        const authMw = this.managers.mws.auth;

        /** API Routes */
        // Auth
        this.app.post('/api/auth/signup', (req, res) => this.managers.user.createUser(req, res));
        this.app.post('/api/auth/login', (req, res) => this.managers.user.login(req, res));

        // Schools (Superadmin)
        this.app.post('/api/schools', authMw, (req, res) => this.managers.school.create(req, res));
        this.app.get('/api/schools', authMw, (req, res) => this.managers.school.list(req, res));

        // Classrooms (School Admin)
        this.app.post('/api/classrooms', authMw, (req, res) => this.managers.classroom.create(req, res));
        this.app.get('/api/classrooms', authMw, (req, res) => this.managers.classroom.list(req, res));

        // Students (School Admin)
        this.app.post('/api/students', authMw, (req, res) => this.managers.student.create(req, res));
        this.app.get('/api/students', authMw, (req, res) => this.managers.student.list(req, res));

        /** Error Handler */
        this.app.use((err, req, res, next) => {
            console.error(err.stack)
            res.status(500).send('Something broke!')
        });

        let server = http.createServer(this.app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
        });
    }
}