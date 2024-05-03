const jwt = require('jsonwebtoken');

module.exports = function(socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                console.log('Token verification failed:', err);
                return next(new Error('Authentication error'));
            }
            socket.decoded = decoded;
            next();
        });
    }
    else {
        console.log('No token provided');
        next(new Error('Authentication error'));
    }
};