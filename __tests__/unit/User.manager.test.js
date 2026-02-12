const mock = require('mock-require');
const sinon = require('sinon');
const { expect } = require('chai');

// Robust Mongoose Mock
const mongooseMock = {
    Schema: class {
        constructor() { }
        static Types = { ObjectId: 'ObjectId' };
    },
    model: () => { }
};
mongooseMock.Schema.Types = { ObjectId: 'ObjectId' };
mock('mongoose', mongooseMock);

// Mock bcrypt-nodejs (sync methods)
const bcryptMock = {
    hashSync: () => 'hashed_pw',
    genSaltSync: () => 'salt',
    compareSync: () => true
};
mock('bcrypt-nodejs', bcryptMock);

// Mock User Model Class
class MockUserModel {
    constructor(data) { Object.assign(this, data); }
    save() { return Promise.resolve(); }
    static findOne() { return Promise.resolve(); }
}

// Mock the model path
mock('../../managers/entities/user/User.model', MockUserModel);

const UserManager = require('../../managers/entities/user/User.manager');
const bcrypt = require('bcrypt-nodejs');

describe('UserManager Unit Tests', () => {
    let userManager;
    let mockTokenManager;
    let req, res;
    let sandbox;
    let mockResponseDispatcher;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        mockTokenManager = {
            genLongToken: sandbox.stub().returns('mock_token')
        };

        mockResponseDispatcher = {
            dispatch: sandbox.stub().callsFake((res, { code, ok, data, errors }) => {
                res.status(code).json({ ok, data, errors });
            })
        };

        userManager = new UserManager({
            config: {},
            managers: {
                token: mockTokenManager,
                responseDispatcher: mockResponseDispatcher
            }
        });

        // Mock Req/Res
        req = { body: {} };
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub()
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('createUser', () => {
        it('should create a user successfully', async () => {
            req.body = {
                username: 'testuser',
                email: 'test@test.com',
                password: 'password123',
                role: 'SCHOOL_ADMIN'
            };

            sandbox.stub(MockUserModel, 'findOne').resolves(null);

            // Stub sync methods on the mock object
            sandbox.stub(bcrypt, 'genSaltSync').returns('salt');
            sandbox.stub(bcrypt, 'hashSync').returns('hashed_password');

            const saveStub = sandbox.stub(MockUserModel.prototype, 'save').resolves();

            await userManager.createUser(req, res);

            expect(MockUserModel.findOne.calledWith({ email: 'test@test.com' })).to.be.true;
            expect(bcrypt.hashSync.calledWith('password123', 'salt')).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.called).to.be.true;
        });

        it('should return error if user already exists', async () => {
            req.body = { email: 'existing@test.com' };
            sandbox.stub(MockUserModel, 'findOne').resolves({ _id: 'existing_id' });

            await userManager.createUser(req, res);

            expect(res.status.calledWith(400)).to.be.true;
        });
    });

    describe('login', () => {
        it('should login successfully with correct credentials', async () => {
            req.body = { email: 'test@test.com', password: 'password123' };

            const mockUser = {
                _id: 'mock_id',
                password: 'hashed_password',
                role: 'SUPERADMIN',
                schoolId: 'school_id'
            };
            sandbox.stub(MockUserModel, 'findOne').resolves(mockUser);
            sandbox.stub(bcrypt, 'compareSync').returns(true);

            await userManager.login(req, res);

            expect(bcrypt.compareSync.calledWith('password123', 'hashed_password')).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
        });
    });
});
