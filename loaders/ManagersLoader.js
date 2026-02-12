const UserServer = require('../managers/http/UserServer.manager');
const UserManager = require('../managers/entities/user/User.manager');
const SchoolManager = require('../managers/entities/school/School.manager');
const ClassroomManager = require('../managers/entities/classroom/Classroom.manager');
const StudentManager = require('../managers/entities/student/Student.manager');
const TokenManager = require('../managers/token/Token.manager'); // Simplified token manager
const AuthMiddleware = require('../managers/mws/Auth.middleware');

module.exports = class ManagersLoader {
    constructor({ config }) {
        this.managers = {};
        this.config = config;
    }

    load() {
        // Initialize Managers
        this.managers.token = new TokenManager({ config: this.config });

        this.managers.user = new UserManager({ config: this.config, managers: this.managers });
        this.managers.school = new SchoolManager({ config: this.config, managers: this.managers });
        this.managers.classroom = new ClassroomManager({ config: this.config, managers: this.managers });
        this.managers.student = new StudentManager({ config: this.config, managers: this.managers });

        // Initialize Middleware
        this.managers.mws = {
            auth: AuthMiddleware({ config: this.config, managers: this.managers })
        };

        // Initialize HTTP Server (UserServer) with explicit access to managers
        this.managers.userServer = new UserServer({ config: this.config, managers: this.managers });

        return this.managers;
    }
}
