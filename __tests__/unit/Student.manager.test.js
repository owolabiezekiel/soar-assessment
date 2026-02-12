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

class MockStudentModel {
    constructor(data) { Object.assign(this, data); }
    save() { return Promise.resolve(); }
    static find() { return Promise.resolve([]); }
}

mock('../../managers/entities/student/Student.model', MockStudentModel);

const StudentManager = require('../../managers/entities/student/Student.manager');

describe('StudentManager Unit Tests', () => {
    let studentManager;
    let req, res;
    let sandbox;
    let mockResponseDispatcher;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        mockResponseDispatcher = {
            dispatch: sandbox.stub().callsFake((res, { code, ok, data, errors }) => {
                res.status(code).json({ ok, data, errors });
            })
        };

        studentManager = new StudentManager({
            config: {},
            managers: {
                responseDispatcher: mockResponseDispatcher
            }
        });

        req = { body: {}, user: { schoolId: 'school_id' } };
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub()
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('create', () => {
        it('should create a student', async () => {
            req.user.role = 'SCHOOL_ADMIN';
            req.body = { name: 'Student A', age: 10, classroomId: 'class_id' };

            const saveStub = sandbox.stub(MockStudentModel.prototype, 'save').resolves();

            await studentManager.create(req, res);

            expect(saveStub.called).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
        });
    });
});
