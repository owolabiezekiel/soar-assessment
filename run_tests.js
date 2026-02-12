const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

const mocha = new Mocha({
    timeout: 10000,
    exit: true
});

const testDirs = [
    path.join(__dirname, '__tests__/unit')
];

testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).filter(file => file.endsWith('.test.js')).forEach(file => {
            mocha.addFile(path.join(dir, file));
        });
    }
});

mocha.run(failures => {
    process.exitCode = failures ? 1 : 0;
});
