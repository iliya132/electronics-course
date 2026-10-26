import express from 'express';
import {resolve} from 'node:path';
const app=express();app.use(express.static('public'));app.get('/widgets',(req,res)=>res.sendFile(resolve('test/fixtures/widgets.html')));app.listen(3002,'127.0.0.1');
