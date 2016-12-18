import {Router} from 'express';
import {query} from '../modules/mysql'
let router = Router();
router
    .get('/',(req,res)=>{
        "use strict";
        res.send("hello woo");
    })
    .get('/login', (req, res)=> {
        "use strict";
        query("select * from test where id=?", [1]).then(data=> {
            res.json(data);
        });
    })
    .post('/', (req, res)=> {
        "use strict";

    })

export default ()=> {
    return router;
}