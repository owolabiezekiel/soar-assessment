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

class MockClassroomModel {
    constructor(data) { Object.assign(this, data); }
    save() { return Promise.resolve(); }
    static find() { return Promise.resolve([]); }
}

mock('../../managers/entities/classroom/Classroom.model', MockClassroomModel);

const ClassroomManager = require('../../managers/entities/classroom/Classroom.manager');

describe('ClassroomManager Unit Tests', () => {
    let classroomManager;
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

        classroomManager = new ClassroomManager({
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
        it('should allow SCHOOL_ADMIN to create a classroom', async () => {
            req.user.role = 'SCHOOL_ADMIN';
            req.body = { name: 'Math Class', grade: '5', capacity: 30 };

            const saveStub = sandbox.stub(MockClassroomModel.prototype, 'save').resolves();

            await classroomManager.create(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(saveStub.called).to.be.true;
        });

        it('should validate schoolId presence', async () => {
            req.user = { role: 'SCHOOL_ADMIN' }; // No schoolId
            await classroomManager.create(req, res);

            // Should call dispatcher with 400
            expect(res.status.calledWith(400)).to.be.true;
        });
    });
});
