const jwt = require('jsonwebtoken');

module.exports = class TokenManager {
    constructor({ config }) {
        this.config = config;
        this.longTokenSecret = config.dotEnv.LONG_TOKEN_SECRET;
        this.shortTokenSecret = config.dotEnv.SHORT_TOKEN_SECRET;
    }

    genLongToken(payload) {
        return jwt.sign(payload, this.longTokenSecret, { expiresIn: '30d' });
    }

    genShortToken(payload) {
        return jwt.sign(payload, this.shortTokenSecret, { expiresIn: '1h' });
    }

    verifyLongToken(token) {
        try {
            return jwt.verify(token, this.longTokenSecret);
        } catch (err) {
            return null;
        }
    }
}