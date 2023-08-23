import mysql from 'mysql';
var con = mysql.createConnection({
    host: "sql6.freesqldatabase.com",
    user: "sql6638911",
    password: "nLFmtarYFE",
    database:"sql6638911"
  });
  
//   con.connect(function(err) {
//     if (err) { console.log(err)}else{
//     console.log("Connected!");}
//   });
export default con;