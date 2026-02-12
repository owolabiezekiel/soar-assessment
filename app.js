
const config = require('./config/index.config.js');
const mongoose = require('mongoose');
const ManagersLoader = require('./loaders/ManagersLoader.js');

// Connect to MongoDB
mongoose.connect(config.dotEnv.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: 'admin',
    pass: 'password',
    authSource: 'admin'
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const managersLoader = new ManagersLoader({ config });
const managers = managersLoader.load();

managers.userServer.run();
