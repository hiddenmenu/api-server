var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 100,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'db'
});

/**
 * @typedef {String} str
 */
function query(){
    "use strict";
    let len=arguments.length;
    if(len==1){
        return new Promise((resolve, reject)=>{
            pool.query(arguments[0], function (err, rows, fields) {
                if (err) reject(err);
                resolve(rows);
            });
        })
    }else if(len==2){
        return new Promise((resolve, reject)=>{
            pool.query(arguments[0],arguments[1], function (err, rows, fields) {
                if (err) reject(err);
                resolve(rows);
            });
        })
    }
}
export {query}