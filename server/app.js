import express from 'express';
import { join,resolve } from 'node:path';
import { courseRoutes } from './routes/course.js';
import { lessonRoutes } from './routes/lessons.js';
import { examRoutes } from './routes/exams.js';
import { reviewRoutes } from './routes/review.js';
import { miscRoutes } from './routes/misc.js';
export function createApp(db,content){
 const app=express();app.disable('x-powered-by');
 app.use((req,res,next)=>{
  const hostAllowed = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;
  if (!hostAllowed.test(req.get('host') || '')) {
    return res.status(403).json({error: 'Недопустимый Host'});
  }
  res.set('X-Content-Type-Options','nosniff');
  res.set('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  const origin=req.get('origin');
  if(!['GET','HEAD','OPTIONS'].includes(req.method)&&origin){
   try{if(new URL(origin).host!==req.get('host'))return res.status(403).json({error:'Чужой источник запроса'});}
   catch{return res.status(403).json({error:'Неверный источник запроса'});}
  }
  next();
 });
 app.use(express.json({limit:'10mb'}));
 app.use((req, _res, next) => {
  req.body ??= {};
  next();
 });
 app.use('/api',courseRoutes(db,content),lessonRoutes(db,content),examRoutes(db,content),reviewRoutes(db,content),miscRoutes(db,content));
 app.use('/api',(_,res)=>res.status(404).json({error:'Маршрут не найден'}));
 app.use('/icons',express.static(join(content.root,'node_modules/lucide-static/icons')));
 app.use(express.static(join(content.root,'public')));
 app.use((err,req,res,next)=>{
  if(res.headersSent)return next(err);
  if(!err.status)console.error(err);
  res.status(err.status||500).json({error:err.status?err.message:'Внутренняя ошибка сервера'});
 });
 return app;
}

