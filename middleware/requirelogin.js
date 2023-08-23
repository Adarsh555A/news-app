// const jwt = require("jsonwebtoken")
import jwt from "jsonwebtoken";
// import  {Jwt_secret}  from "../key.js";

// const mongoose = require("mongoose");
import con from '../models/connection.js';

export default  (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "You must have logged in 1" })
    }
    const token = authorization.replace("Bearer ", "")
    jwt.verify(token, Jwt_secret, (err, payload) => {
        if (err) {
            return res.status(401).json({ error: "You must have logged in 2" })
        }
        const { id } = payload
        var sqldata = 'SELECT * FROM signup WHERE id = ?';
        con.query(sqldata, [id], function (err, result) {
          if (err) {
            return res.status(401).json({ error: "You must have logged in 2" })

          }else{
            if (!result[0]) {
            }else{
              next()

            }
    
          }
    
        });
        // USER.findById(_id).then(userData => {
        //     req.user = userData
        //     next()
        // })
    })

}
/**
 * frontend mein iss tarah se code likhe ge
   fetch(`/allposts?limit=${limit}&skip=${skip}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
 **/