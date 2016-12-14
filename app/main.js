'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _fileStreamRotator = require('file-stream-rotator');

var _fileStreamRotator2 = _interopRequireDefault(_fileStreamRotator);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var numCPUs = require('os').cpus().length;

var logDirectory = _path2.default.join(__dirname, '../logs');


if (_cluster2.default.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        _cluster2.default.fork();
    }
    _cluster2.default.on('exit', function (worker, code, signal) {
        _cluster2.default.fork();
    });
    if (process.env.NODE_ENV === 'development') {
        console.log("in dev mode");
    }
    if (process.env.NODE_ENV === 'production') {
        console.log("in prod mode");
    }
}

if (_cluster2.default.isWorker) {
    var app = (0, _express2.default)();
    app.use(_bodyParser2.default.json({
        type: 'application/json'
    }));

    app.use((0, _helmet2.default)());
    app.use((0, _cors2.default)());

    if (process.env.NODE_ENV === 'production') {
        _fs2.default.existsSync(logDirectory) || _fs2.default.mkdirSync(logDirectory);

        var accessLogStream = _fileStreamRotator2.default.getStream({
            date_format: 'YYYYMMDD',
            filename: _path2.default.join(logDirectory, 'access-%DATE%.log'),
            frequency: 'daily',
            verbose: false
        });
        app.use((0, _morgan2.default)('short', {
            stream: accessLogStream,
            skip: function skip(req, res) {
                return res.statusCode < 400;
            }
        }));
    }

    app.use('/user', (0, _user2.default)());

    if (process.env.NODE_ENV === 'development') {
        app.use((0, _errorhandler2.default)());
    }
    app.listen(3001);
}