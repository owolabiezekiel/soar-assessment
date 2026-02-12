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

class MockSchoolModel {
    constructor(data) { Object.assign(this, data); }
    save() { return Promise.resolve(); }
    static find() { return Promise.resolve([]); }
}

mock('../../managers/entities/school/School.model', MockSchoolModel);

const SchoolManager = require('../../managers/entities/school/School.manager');

describe('SchoolManager Unit Tests', () => {
    let schoolManager;
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

        schoolManager = new SchoolManager({
            config: {},
            managers: {
                responseDispatcher: mockResponseDispatcher
            }
        });

        req = { body: {}, user: {} };
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub()
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('create', () => {
        it('should allow SUPERADMIN to create a school', async () => {
            req.user.role = 'SUPERADMIN';
            req.body = { name: 'Test School', address: '123 St' };

            const saveStub = sandbox.stub(MockSchoolModel.prototype, 'save').resolves();

            await schoolManager.create(req, res);

            expect(saveStub.called).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
        });

        it('should forbid non-SUPERADMIN users', async () => {
            req.user.role = 'SCHOOL_ADMIN';
            const saveStub = sandbox.stub(MockSchoolModel.prototype, 'save').resolves();

            await schoolManager.create(req, res);

            // Expect 403 status (implementation uses res.status direct or via dispatcher)
            expect(res.status.calledWith(403)).to.be.true;
            expect(saveStub.called).to.be.false;
        });
    });
});
