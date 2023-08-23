// const express = require('express');
import express  from 'express';

const user_route = express();
// const bodyparser = require('body-parser')
import bodyparser  from 'body-parser';

// const session = require('express-session');
import session  from 'express-session';

const { SESSION_SECRET } = process.env;

user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({extended: true}))
user_route.use(session({ secret: "SESSION_SECRET"}))

// user_route.set('view engine' , 'ejs')
// user_route.set('views' , './views')

user_route.use(express.static('public'));
// import path  from 'path';

// const path = require('path');
// const multer = require('multer');
// import multer  from 'multer';

// const storage = multer.diskStorage({
//     destination: function (req, file, cb){
//         cb(null, path.join(__dirname, '../public/images'))
//     },
//     filename: function(req, file, cb){
//         const name = Date.now() + '-' + file.originalname;
//         cb(null, name)
//     }
// })

// const upload  = multer({ storage: storage});
import  userControl  from '../controllers/userControl.js';
import  requireLogin  from "../middleware/requirelogin.js";

// const userControl = require('../controllers/userControl')
// const auth = require('../middleware/auth');
// import  auth  from '../middleware/auth.js';

// agar koi resgister url par hit kata hai toh page pe jane se pehle humara middleware yaani auth check karega ki user koi login logout kiya hai ki nahi 
user_route.get('/resgister', userControl.registerload)
user_route.post('/resgister', userControl.register)
// agar koi / url par hit kata hai toh page pe jane se pehle humara middleware yaani auth check karega ki user koi login logout kiya hai ki nahi 
// user_route.get('/',  userControl.loadLogin);
user_route.post('/', userControl.login);
// agar koi logout url par hit kata hai toh page pe jane se pehle humara middleware yaani auth check karega ki user koi logout login kiya hai ki nahi 
user_route.get('/logout', userControl.logout);
// agar koi dashboard url par hit kata hai toh page pe jane se pehle humara middleware yaani auth check karega ki user koi login kiya hai ki nahi 
user_route.get('/dashboard', userControl.loaddashboard);
user_route.get('/newspage', userControl.newspage);
user_route.get('/newstoday', userControl.indiatoday);
user_route.get('/gnews', userControl.gnewstoday);
user_route.get('/imgslider', userControl.imgslider);

// user_route.get("/sports", userControl.sports);
// user_route.get("/technology/:id", userControl.tech);
// user_route.get("/business/:id", userControl.business);
// user_route.get("/entertainment/:id", userControl.entertainment);

// user_route.get('*', function (req, res) {
//     res.redirect('/')
// });

export default  user_route;