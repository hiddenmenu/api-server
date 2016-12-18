import express from 'express'
import cluster from 'cluster'
const numCPUs = require('os').cpus().length;
import bodyParser from 'body-parser';
import morgan from 'morgan'
import FileStreamRotator from 'file-stream-rotator';
import path from 'path';
const logDirectory = path.join(__dirname, '../logs');
import fs from 'fs';
import errorHandler from 'errorhandler';
import helmet from 'helmet'
import cors from 'cors';
import child_process from 'child_process'

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });
    if (process.env.NODE_ENV === 'development') {
        console.log("in dev mode");
    }
    if (process.env.NODE_ENV === 'production') {
        console.log("in prod mode");
    }

}

import user from './user'


if (cluster.isWorker) {
    let app = express();
    app.use(bodyParser.json({
        type: 'application/json'
    }));

    app.use(helmet());
    app.use(cors());

    if (process.env.NODE_ENV === 'production') {
        fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

        let accessLogStream = FileStreamRotator.getStream({
            date_format: 'YYYYMMDD',
            filename: path.join(logDirectory, 'access-%DATE%.log'),
            frequency: 'daily',
            verbose: false
        });
        app.use(morgan('short', {
            stream: accessLogStream,
            skip: (req, res)=> {
                return res.statusCode < 400
            }
        }));
    }

    app.use('/user', user());
    app.use('/auto',()=>{
        "use strict";
        child_process.exec("sh auto.sh", (err, result, what)=> {
            console.log(result);
        });
    })
    if (process.env.NODE_ENV === 'development') {
        app.use(errorHandler())
    }
    app.listen(3000);
}
