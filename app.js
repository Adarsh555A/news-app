
import dotenv  from 'dotenv';
dotenv.config();
// import mongoose  from 'mongoose';
// mongoose.connect('mongodb://127.0.0.1:27017/admin').then( () => console.log("Mongodb is connected!"))
import express  from 'express';
// import mysql from 'mysql'
const app = express();
import http  from 'http';
// import  {Jwt_secret}  from "./key.js";
import con from './models/connection.js';
const http1 = http.Server(app)
import  user_route  from './routes/uswrRoute.js';

// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: ""
//   });
  
//   con.connect(function(err) {
//     if (err) { console.log(err)}else{
//     console.log("Connected!");

// }
//   });
// const userRoute = require('./routes/uswrRoute')
app.use('/', user_route)
// app.get("/login", (req, res) => {
//     res.json({status: "sucess"})
// })
http1.listen(5500, function (){
    console.log('server started')
})