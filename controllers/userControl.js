// const User = require('../models/userModels');
// import User from '../models/userModels.js';
// import googleNewsScraper from 'google-news-scraper';
// const bcrypt = require('bcrypt')
// import bcrypt from 'bcrypt';
// import fs from 'fs/promises';
import fetch from 'node-fetch';
// import util from 'util';
import con from '../models/connection.js';
import jwt from "jsonwebtoken";
import Jwt_secret from '../key.js';
import axios from 'axios';
import cheerio from 'cheerio';
// const {parseString} = require('xml2js');
import { Parser, parseString } from 'xml2js';

const registerload = async (req, res) => {
  try {
    res.render('register')
  }
  catch (err) {
    console.log(err.message)
  }
}
const register = async (req, res) => {
  try {
    // const passwordhash = await bcrypt.hash(req.body.password, 10);






    const { email_verified, email, name, id, userName, Photo } = req.body
    if (email_verified) {

      // res.send([email,name])
      var sqldata = 'SELECT * FROM signup WHERE email = ? AND id = ?';
      con.query(sqldata, [email, id], function (err, result) {
        if (err) { console.log(err) } else {
          // agar id email match nahi hota hai toh new resgistration kardo
          if (!result[0]) {
            console.log(result)

            var sql = `INSERT INTO signup (id, name, email) VALUES ?`;
            var values = [[id, name, email]];
            con.query(sql, [values], function (error, result) {
              if (error) { console.log(error) } else {
                // console.log(result)
                // res.send(result)
                // console.log(` ${result[0].id} added successfully!`);
                const token = jwt.sign({ id: id }, Jwt_secret.Jwt_secret)
                const user = [id, name, email]
                res.json({ token, user })
              }


            });


          } else {
            // console.log(result)
            // console.log(Jwt_secret.Jwt_secret)
            // res.send(result)
            const token = jwt.sign({ id: result[0].id }, Jwt_secret.Jwt_secret)
            const user = [result[0].id, result[0].name, result[0].email]
            res.json({ token, user })
            // console.log({ token, user: { _id, name, email, userName } })

          }
        }
      })
      // USER.findOne({ email: email }).then((savedUser) => {
      //     if (savedUser) {


      //       }})
    }










    // var name = await req.body.name;
    // var email = await req.body.email;
    // // res.send([name, email])
    // // console.log(name)

    // res.render('register', { message: 'Resgistration Successfully!' })
  }
  catch (err) {
    console.log(err.message + "ggg")
  }
}
// const loadLogin = async (req, res) => {
//   try {
//     res.render('login')
//   } catch (error) {
//     console.log(error.message)
//   }
// }
const login = async (req, res) => {
  try {
    const email = req.body.email;
    const id = req.body.password;
    var sqldata = 'SELECT * FROM signup WHERE email = ? AND id = ?';
    con.query(sqldata, [email, id], function (err, result) {
      if (err) { console.log(err) } else {
        if (!result[0]) {
          res.send("wrong email and id")

        } else {
          console.log(result)
          res.send(result)

        }
      }

    });

  } catch (error) {
    console.log(error.message + "login")
  }
}

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/')

  } catch (error) {
    console.log(error.message)
  }
}


const loaddashboard = async (req, res) => {
  try {
    let subject = req.query.search;
    console.log(subject)
    await fetch(`https://news.google.com/rss/search?q=${subject}&hl=en-IN&gl=IN&ceid=IN:hi`, {
      method: 'GET',
      headers: { 'Content-Type': 'text/xml' }
    }).then(res => {
      return res.text();
    }).then((restext) => {
      // console.log(restext)
      var xmldata = restext;
      parseString(xmldata, function async(err, result) {
        var data = JSON.stringify(result);

        let condata = JSON.parse(data)
        // console.log(condata.rss.channel[0].item.length)
        // var imagearr = [];
        // var datatitle = [];
        var limit = !parseInt(req.query.id) ? 1 : parseInt(req.query.id) > 5 ? 1 : parseInt(req.query.id);
        console.log(limit)

        let limitend = !limit ? 1 * 10 : limit * 10;

        console.log(limitend)
        let limitstart = limitend - 9;
        const datasend = [];
        for (let i = limitstart; i < limitend; i++) {


          const websiteURL = condata.rss.channel[0].item[i].link;
          axios.get(websiteURL)
            .then(response => {
              const htmlContent = response.data;
              const $ = cheerio.load(htmlContent);


              const elements = $('a');
              // Print the extracted HTML content
              elements.each((index, element) => {
                const content = $(element).attr('href');
                // console.log(content);


                axios.get(content)
                  .then(response => {
                    const htmlContent = response.data;
                    const $ = cheerio.load(htmlContent);

                    // Replace 'tag_name' with the HTML tag you want to extract (e.g., 'div', 'p', 'a', etc.)
                    const imgelements = $("meta[property='og:image']");
                    // const imgelements2 = $("h1");

                    // Print the extracted HTML content
                    imgelements.each((index, element) => {
                      const contentimg = $(element).attr('content');
                      // colleteddata()
                      // imagearr.push(contentimg)
                      // datatitle.push(condata.rss.channel[0].item[i].title)
                      const objdatasend = { "title": condata.rss.channel[0].item[i].title, "image": contentimg, "url": condata.rss.channel[0].item[i].link };
                      datasend.push(objdatasend)



                      // console.log(contentimg)
                    });
                    // imgelements2.each((index, element) => {
                    //   const contentimg2 = element
                    //   // colleteddata()
                    //   imagearr.push(contentimg2)




                    // });
                    if (datasend.length === 9) {
                      res.send(datasend)

                    }

                  })

                  .catch(error => {
                    if(error){
                      res.send({error:'Undefined'})
                    }
                    console.error('Error fetching the website:', error.message);
                  });



              });



            })
            .catch(error => {
              console.error('Error fetching the website:', error.message);
            });


        }




      })
    }).catch(err => console.log(err))


  } catch (error) {
    console.log(error.message)
  }
}
const newspage = async (req, res) => {
  try {
    let datatext = [];
    const { newspageurl } = req.headers;
    if (!newspageurl) {
      res.send('error')
    } else {


      axios.get(newspageurl)
        .then(response => {
          const htmlContent = response.data;
          const $ = cheerio.load(htmlContent);

          // Replace 'tag_name' with the HTML tag you want to extract (e.g., 'div', 'p', 'a', etc.)
          const imgelements = $("meta[property='og:description']")
          // const imgelements2 = $("h1");

          // Print the extracted HTML content
          imgelements.each((index, element) => {
            const contentimg = $(element).attr('content');
            datatext.push(contentimg)

          });
          console.log(datatext)
          res.send(datatext)

          // imgelements2.each((index, element) => {
          //   const contentimg2 = element
          //   // colleteddata()
          //   imagearr.push(contentimg2)




          // });

        })

        .catch(error => {
          console.error('Error fetching the website:', error.message);
        });
    }
  } catch (error) {
    console.log(error.message)
  }
}
const indiatoday = async (req, res) => {
  const datalen = [];
  try {
    var i = !parseInt(req.query.id) ? 1 : parseInt(req.query.id) > 5 ? 1 : parseInt(req.query.id);
    console.log(i)
    console.log(i)
    let sports = [{}, { "weburl": "https://www.bhaskar.com/sports/", "webxlink": "https://www.bhaskar.com", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://www.aajtak.in/sports/cricket", "webxlink": "", "webdirecion": "div.widget-listing-thumb > a" }, { "weburl": "https://www.hindustantimes.com/sports", "webxlink": "https://www.hindustantimes.com", "webdirecion": "h3[class='hdg3'] > a" }];
    let technology = [{}, { "weburl": "https://www.bhaskar.com/tech-auto/", "webxlink": "https://www.bhaskar.com", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://indianexpress.com/section/technology", "webxlink": "", "webdirecion": "div.top-article > ul > li > figure > a" }, { "weburl": "https://www.hindustantimes.com/technology", "webxlink": "https://www.hindustantimes.com", "webdirecion": "h3[class='hdg3'] > a" }];
    let entertainment = [{}, { "weburl": "https://www.bhaskar.com/entertainment/", "webxlink": "https://www.bhaskar.com", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://www.indiatoday.in/entertainment/", "webxlink": "https://www.indiatoday.in/entertainment/", "webdirecion": "div[class='B1S3_content__wrap__9mSB6'] > h2 > a" }, { "weburl": "https://www.hindustantimes.com/entertainment", "webxlink": "https://www.hindustantimes.com", "webdirecion": "h3[class='hdg3'] > a" }];
    let business = [{}, { "weburl": "https://www.bhaskar.com/business/", "webxlink": "https://www.bhaskar.com", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://www.timesnownews.com/business-economy/companies", "webxlink": "", "webdirecion": "div._1W5s > a" }, { "weburl": "https://www.hindustantimes.com/business", "webxlink": "https://www.hindustantimes.com", "webdirecion": "h3[class='hdg3'] > a" }];
    let newsdata = [{}, { "weburl": "https://www.bhaskar.com/", "webxlink": "https://www.bhaskar.com/", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://www.aajtak.in/india/news", "webxlink": "", "webdirecion": "div.widget-listing-thumb > a" }, { "weburl": "https://www.hindustantimes.com/", "webxlink": "https://www.hindustantimes.com/", "webdirecion": "h3[class='hdg3'] > a" }, { "weburl": "https://timesofindia.indiatimes.com/", "webxlink": "", "webdirecion": "div.col_l_6 > figure > a" }, { "weburl": "https://www.news18.com/india/", "webxlink": "", "webdirecion": "a[class='jsx-1374841737']" }];



    let data = req.query.category === 'sports' ? sports : req.query.category === 'technology' ? technology : req.query.category === 'entertainment' ? entertainment : req.query.category === "business" ? business : newsdata;
    console.log(data)
    const datasend = [];
    


    axios.get(data[i].weburl)
      .then(response => {
        const htmlContent = response.data;
        const $ = cheerio.load(htmlContent);


        const elements = $(data[i].webdirecion);
        // Print the extracted HTML content
        elements.each((index, element) => {
          const content = $(element).attr('href');
          // console.log(content);
          let urln = data[i].webxlink + content;
          // console.log(urln)
             datalen.push(urln)
          axios.get(urln)
            .then(response => {
              const htmlContent = response.data;
              const $ = cheerio.load(htmlContent);

              // Replace 'tag_name' with the HTML tag you want to extract (e.g., 'div', 'p', 'a', etc.)
              const imgelements = $("meta[property='og:image']");
              const elementsdes = $("meta[name='description']");
              const elementstitle = $("meta[property='og:title']");
              const elementsurl = $("meta[property='og:url']");

              // Print the extracted HTML content

              var getimage;
              imgelements.each((index, element) => {
                const contentimg = $(element).attr('content');
                // const objdatasend = {"image":contentimg };
                //  datasend.push(objdatasend)
                getimage = contentimg
              });
              var gettitle;

              elementstitle.each((index, element) => {
                const contenttitle = $(element).attr('content')
                // const objdatasend = {"image":contentimg };
                //  datasend.push(objdatasend)
                gettitle = contenttitle
              });
              var geturl;

              elementsurl.each((index, element) => {
                const contenturl = $(element).attr('content')
                // const objdatasend = {"image":contentimg };
                //  datasend.push(objdatasend)
                geturl = contenturl
              });
              elementsdes.each((index, element) => {
                const contentdes = $(element).attr('content');
                const objtdatasend = { "title": gettitle, "image": getimage, "description": contentdes, "url": geturl };
                datasend.push(objtdatasend)
              });
              // imgelements2.each((index, element) => {
              //   const contentimg2 = element
              //   // colleteddata()
              //   imagearr.push(contentimg2)
              // console.log(datalen.length)
              if (datasend.length === datalen.length || datasend.length === 20) {
                // console.log(datasend.length)

                res.send(datasend)



              }


              // });


            })

            .catch(error => {
              console.error('Error fetching the website:', error.message);
            });



        });



      })
      .catch(error => {
        console.error('Error fetching the website:', error.message);
      });



  } catch (error) {
    console.error(error);
  }

}

const imgslider = async (req, res) => {
  try {
    await fetch(`https://news.google.com/rss/search?q=india&hl=hi&gl=IN&ceid=IN:hi`, {
      method: 'GET',
      headers: { 'Content-Type': 'text/xml' }
    }).then(res => {
      return res.text();
    }).then((restext) => {
      // console.log(restext)
      var xmldata = restext;
      parseString(xmldata, function async(err, result) {
        var data = JSON.stringify(result);

        let condata = JSON.parse(data)
        // console.log(condata.rss.channel[0].item.length)
        // var imagearr = [];
        // var datatitle = [];
        // var limit = !parseInt(req.query.id) ? 1 : parseInt(req.query.id) > 5 ? 1 : parseInt(req.query.id);
        // console.log(limit)

        // let limitend = !limit ? 1 * 10 : limit * 10;

        // console.log(limitend)
        // let limitstart = limitend - 9;
        const datasend = [];
        for (let i = 0; i < 3; i++) {


          const websiteURL = condata.rss.channel[0].item[i].link;
          // console.log(websiteURL)
          axios.get(websiteURL)
            .then(response => {
              const htmlContent = response.data;
              const $ = cheerio.load(htmlContent);


              const elements = $('a');
              // Print the extracted HTML content
              elements.each((index, element) => {
                const content = $(element).attr('href');
                // console.log(content);


                axios.get(content)
                  .then(response => {
                    const htmlContent = response.data;
                    const $ = cheerio.load(htmlContent);

                    // Replace 'tag_name' with the HTML tag you want to extract (e.g., 'div', 'p', 'a', etc.)
                    const imgelements = $("meta[property='og:image']");
                    // const imgelements2 = $("h1");

                    // Print the extracted HTML content
                    imgelements.each((index, element) => {
                      const contentimg = $(element).attr('content');
                      // colleteddata()
                      // imagearr.push(contentimg)
                      // datatitle.push(condata.rss.channel[0].item[i].title)
                      let text = condata.rss.channel[0].item[i].title;
                      let result = text.slice(0, 50);

                      const objdatasend = { "title": result, "image": contentimg, "url": condata.rss.channel[0].item[i].link };
                      datasend.push(objdatasend)



                      // console.log(contentimg)
                    });
                    // imgelements2.each((index, element) => {
                    //   const contentimg2 = element
                    //   // colleteddata()
                    //   imagearr.push(contentimg2)




                    // });
                    if (datasend.length === 3) {
                      res.send(datasend)

                    }

                  })

                  .catch(error => {
                    console.error('Error fetching the website:', error.message);
                  });



              });



            })
            .catch(error => {
              console.error('Error fetching the website:', error.message);
            });


        }




      })
    }).catch(err => console.log(err))


  } catch (error) {
    console.log(error.message)
  }
}
// const sports = async (req, res) => {
//   try {
//     var i = !parseInt(req.query.id) ? 1 : parseInt(req.query.id) > 3 ? 1 : parseInt(req.query.id);
//     console.log(i)
//     let sports = [{},{ "weburl": "https://www.bhaskar.com/sports/","webxlink":"https://www.bhaskar.com", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://www.indiatoday.in/sport/","webxlink":"https://www.indiatoday.in/sports/", "webdirecion": "div[class='B1S3_content__wrap__9mSB6'] > h2 > a" }, { "weburl": "https://www.hindustantimes.com/sports","webxlink":"https://www.hindustantimes.com", "webdirecion": "h3[class='hdg3'] > a" }];
//     let technology = [{},{ "weburl": "https://www.bhaskar.com/tech-auto/","webxlink":"https://www.bhaskar.com", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://www.abplive.com/technology","webxlink":"", "webdirecion": "div.other_news > a" }, { "weburl": "https://www.hindustantimes.com/technology","webxlink":"https://www.hindustantimes.com", "webdirecion": "h3[class='hdg3'] > a" }];
//     let entertainment =  [{},{ "weburl": "https://www.bhaskar.com/entertainment/","webxlink":"https://www.bhaskar.com", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://www.indiatoday.in/entertainment/","webxlink":"https://www.indiatoday.in/entertainment/", "webdirecion": "div[class='B1S3_content__wrap__9mSB6'] > h2 > a" }, { "weburl": "https://www.hindustantimes.com/entertainment","webxlink":"https://www.hindustantimes.com", "webdirecion": "h3[class='hdg3'] > a" }];
//     let business = [{},{ "weburl": "https://www.bhaskar.com/business/","webxlink":"https://www.bhaskar.com", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://www.indiatoday.in/business/","webxlink":"https://www.indiatoday.in/business/", "webdirecion": "div[class='B1S3_content__wrap__9mSB6'] > h2 > a" }, { "weburl": "https://www.hindustantimes.com/business","webxlink":"https://www.hindustantimes.com", "webdirecion": "h3[class='hdg3'] > a" }];



//     let data = req.query.category === 'sport'?sports:req.query.category === 'technology'?technology:req.query.category === 'entertainment'?entertainment:business;
//     const datasend = [];


//       axios.get(data[i].weburl)
//         .then(response => {
//           const htmlContent = response.data;
//           const $ = cheerio.load(htmlContent);


//           const elements = $(data[i].webdirecion);
//           // Print the extracted HTML content
//           elements.each((index, element) => {
//             const content = $(element).attr('href');
//             // console.log(content);
//             let urln = data[i].webxlink + content;
//             // console.log(urln)

//             axios.get(urln)
//               .then(response => {
//                 const htmlContent = response.data;
//                 const $ = cheerio.load(htmlContent);

//                 // Replace 'tag_name' with the HTML tag you want to extract (e.g., 'div', 'p', 'a', etc.)
//                 const imgelements = $("meta[property='og:image']");
//                 const elementsdes = $("meta[name='description']");
//                 const elementstitle = $("meta[property='og:title']");
//                 const elementsurl = $("meta[property='og:url']");

//                 // Print the extracted HTML content

//                 var getimage;
//                 imgelements.each((index, element) => {
//                   const contentimg = $(element).attr('content');
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   getimage = contentimg
//                 });
//                 var gettitle;

//                 elementstitle.each((index, element) => {
//                   const contenttitle = $(element).attr('content')
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   gettitle = contenttitle
//                 });
//                 var geturl;

//                 elementsurl.each((index, element) => {
//                   const contenturl = $(element).attr('content')
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   geturl = contenturl
//                 });
//                 elementsdes.each((index, element) => {
//                   const contentdes = $(element).attr('content');
//                   const objtdatasend = { "title": gettitle, "image": getimage, "description": contentdes, "url": geturl };
//                   datasend.push(objtdatasend)
//                 });
//                 // imgelements2.each((index, element) => {
//                 //   const contentimg2 = element
//                 //   // colleteddata()
//                 //   imagearr.push(contentimg2)
//                 if (datasend.length === 20) {
//                   console.log(datasend.length)

//                   res.send(datasend)



//                 }


//                 // });


//               })

//               .catch(error => {
//                 console.error('Error fetching the website:', error.message);
//               });



//           });



//         })
//         .catch(error => {
//           console.error('Error fetching the website:', error.message);
//         });



//   } catch (error) {
//     console.error(error);
//   }

// }
// const tech = async (req, res) => {
//   try {
//     var i = !parseInt(req.params.id) ? 1 : parseInt(req.params.id) > 3 ? 1 : parseInt(req.params.id);
//     console.log(i)
//     let data = [{},{ "weburl": "https://www.bhaskar.com/tech-auto/","webxlink":"https://www.bhaskar.com", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://www.abplive.com/technology","webxlink":"", "webdirecion": "div.other_news > a" }, { "weburl": "https://www.hindustantimes.com/technology","webxlink":"https://www.hindustantimes.com", "webdirecion": "h3[class='hdg3'] > a" }];
//     const datasend = [];


//       axios.get(data[i].weburl)
//         .then(response => {
//           const htmlContent = response.data;
//           const $ = cheerio.load(htmlContent);


//           const elements = $(data[i].webdirecion);
//           // Print the extracted HTML content
//           elements.each((index, element) => {
//             const content = $(element).attr('href');
//             console.log(content);
//             let urln = data[i].webxlink + content;
//             // console.log(urln)

//             axios.get(urln)
//               .then(response => {
//                 const htmlContent = response.data;
//                 const $ = cheerio.load(htmlContent);

//                 // Replace 'tag_name' with the HTML tag you want to extract (e.g., 'div', 'p', 'a', etc.)
//                 const imgelements = $("meta[property='og:image']");
//                 const elementsdes = $("meta[name='description']");
//                 const elementstitle = $("meta[property='og:title']");
//                 const elementsurl = $("meta[property='og:url']");

//                 // Print the extracted HTML content

//                 var getimage;
//                 imgelements.each((index, element) => {
//                   const contentimg = $(element).attr('content');
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   getimage = contentimg
//                 });
//                 var gettitle;

//                 elementstitle.each((index, element) => {
//                   const contenttitle = $(element).attr('content')
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   gettitle = contenttitle
//                 });
//                 var geturl;

//                 elementsurl.each((index, element) => {
//                   const contenturl = $(element).attr('content')
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   geturl = contenturl
//                 });
//                 elementsdes.each((index, element) => {
//                   const contentdes = $(element).attr('content');
//                   const objtdatasend = { "title": gettitle, "image": getimage, "description": contentdes, "url": geturl };
//                   datasend.push(objtdatasend)
//                 });
//                 // imgelements2.each((index, element) => {
//                 //   const contentimg2 = element
//                 //   // colleteddata()
//                 //   imagearr.push(contentimg2)
//                 if (datasend.length === 19) {
//                   console.log(datasend.length)

//                   res.send(datasend)



//                 }


//                 // });


//               })

//               .catch(error => {
//                 console.error('Error fetching the website:', error.message);
//               });



//           });



//         })
//         .catch(error => {
//           console.error('Error fetching the website:', error.message);
//         });



//   } catch (error) {
//     console.error(error);
//   }

// }
// const business = async (req, res) => {
//   try {
//     var i = !parseInt(req.params.id) ? 1 : parseInt(req.params.id) > 3 ? 1 : parseInt(req.params.id);
//     console.log(i)
//     let data = [{},{ "weburl": "https://www.bhaskar.com/business/","webxlink":"https://www.bhaskar.com", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://www.indiatoday.in/business/","webxlink":"https://www.indiatoday.in/business/", "webdirecion": "div[class='B1S3_content__wrap__9mSB6'] > h2 > a" }, { "weburl": "https://www.hindustantimes.com/business","webxlink":"https://www.hindustantimes.com", "webdirecion": "h3[class='hdg3'] > a" }];
//     const datasend = [];


//       axios.get(data[i].weburl)
//         .then(response => {
//           const htmlContent = response.data;
//           const $ = cheerio.load(htmlContent);


//           const elements = $(data[i].webdirecion);
//           // Print the extracted HTML content
//           elements.each((index, element) => {
//             const content = $(element).attr('href');
//             // console.log(content);
//             let urln = data[i].webxlink + content;
//             // console.log(urln)

//             axios.get(urln)
//               .then(response => {
//                 const htmlContent = response.data;
//                 const $ = cheerio.load(htmlContent);

//                 // Replace 'tag_name' with the HTML tag you want to extract (e.g., 'div', 'p', 'a', etc.)
//                 const imgelements = $("meta[property='og:image']");
//                 const elementsdes = $("meta[name='description']");
//                 const elementstitle = $("meta[property='og:title']");
//                 const elementsurl = $("meta[property='og:url']");

//                 // Print the extracted HTML content

//                 var getimage;
//                 imgelements.each((index, element) => {
//                   const contentimg = $(element).attr('content');
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   getimage = contentimg
//                 });
//                 var gettitle;

//                 elementstitle.each((index, element) => {
//                   const contenttitle = $(element).attr('content')
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   gettitle = contenttitle
//                 });
//                 var geturl;

//                 elementsurl.each((index, element) => {
//                   const contenturl = $(element).attr('content')
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   geturl = contenturl
//                 });
//                 elementsdes.each((index, element) => {
//                   const contentdes = $(element).attr('content');
//                   const objtdatasend = { "title": gettitle, "image": getimage, "description": contentdes, "url": geturl };
//                   datasend.push(objtdatasend)
//                 });
//                 // imgelements2.each((index, element) => {
//                 //   const contentimg2 = element
//                 //   // colleteddata()
//                 //   imagearr.push(contentimg2)
//                 if (datasend.length === 20) {
//                   console.log(datasend.length)

//                   res.send(datasend)



//                 }


//                 // });


//               })

//               .catch(error => {
//                 console.error('Error fetching the website:', error.message);
//               });



//           });



//         })
//         .catch(error => {
//           console.error('Error fetching the website:', error.message);
//         });



//   } catch (error) {
//     console.error(error);
//   }

// }
// const entertainment = async (req, res) => {
//   try {
//     var i = !parseInt(req.params.id) ? 1 : parseInt(req.params.id) > 3 ? 1 : parseInt(req.params.id);
//     console.log(i)
//     let data = [{},{ "weburl": "https://www.bhaskar.com/entertainment/","webxlink":"https://www.bhaskar.com", "webdirecion": "div.ba1e62a6 > ul > div > li > a" }, { "weburl": "https://www.indiatoday.in/entertainment/","webxlink":"https://www.indiatoday.in/entertainment/", "webdirecion": "div[class='B1S3_content__wrap__9mSB6'] > h2 > a" }, { "weburl": "https://www.hindustantimes.com/entertainment","webxlink":"https://www.hindustantimes.com", "webdirecion": "h3[class='hdg3'] > a" }];
//     const datasend = [];


//       axios.get(data[i].weburl)
//         .then(response => {
//           const htmlContent = response.data;
//           const $ = cheerio.load(htmlContent);


//           const elements = $(data[i].webdirecion);
//           // Print the extracted HTML content
//           elements.each((index, element) => {
//             const content = $(element).attr('href');
//             // console.log(content);
//             let urln = data[i].webxlink + content;
//             // console.log(urln)

//             axios.get(urln)
//               .then(response => {
//                 const htmlContent = response.data;
//                 const $ = cheerio.load(htmlContent);

//                 // Replace 'tag_name' with the HTML tag you want to extract (e.g., 'div', 'p', 'a', etc.)
//                 const imgelements = $("meta[property='og:image']");
//                 const elementsdes = $("meta[name='description']");
//                 const elementstitle = $("meta[property='og:title']");
//                 const elementsurl = $("meta[property='og:url']");

//                 // Print the extracted HTML content

//                 var getimage;
//                 imgelements.each((index, element) => {
//                   const contentimg = $(element).attr('content');
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   getimage = contentimg
//                 });
//                 var gettitle;

//                 elementstitle.each((index, element) => {
//                   const contenttitle = $(element).attr('content')
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   gettitle = contenttitle
//                 });
//                 var geturl;

//                 elementsurl.each((index, element) => {
//                   const contenturl = $(element).attr('content')
//                   // const objdatasend = {"image":contentimg };
//                   //  datasend.push(objdatasend)
//                   geturl = contenturl
//                 });
//                 elementsdes.each((index, element) => {
//                   const contentdes = $(element).attr('content');
//                   const objtdatasend = { "title": gettitle, "image": getimage, "description": contentdes, "url": geturl };
//                   datasend.push(objtdatasend)
//                 });
//                 // imgelements2.each((index, element) => {
//                 //   const contentimg2 = element
//                 //   // colleteddata()
//                 //   imagearr.push(contentimg2)
//                 if (datasend.length === 20) {
//                   console.log(datasend.length)

//                   res.send(datasend)



//                 }





//               })

//               .catch(error => {
//                 console.error('Error fetching the website:', error.message);
//               });



//           });



//         })
//         .catch(error => {
//           console.error('Error fetching the website:', error.message);
//         });



//   } catch (error) {
//     console.error(error);
//   }

// }
const gnewstoday = async (req, res) => {
  try {
    let datatext = [];
    let dataimg = [];
    axios.get('https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGx1YlY4U0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-IN&gl=IN&ceid=IN%3Ahi')
      .then(response => {
        const htmlContent = response.data;
        const $ = cheerio.load(htmlContent);

        // Replace 'tag_name' with the HTML tag you want to extract (e.g., 'div', 'p', 'a', etc.)
        const imgelements = $("img[class='Quavad']")
        const titleelements = $("h4[class='gPFEn']")

        // const imgelements2 = $("h1");

        // Print the extracted HTML content
        imgelements.each((index, element) => {
          const contentimg = $(element).attr('srcset');
          // console.log(contentimg)
          dataimg.push({ "image": contentimg })


        });
        titleelements.each((index, element) => {
          const contenttitle = $(element).text();
          const obj = { "title": contenttitle, "url": "news.google.com" };
          datatext.push(obj);

        });
        // two arrays merger into object
        const mergedArray = datatext.map((titleObj, index) => ({
          ...titleObj,
          ...dataimg[index]
        }));
        console.log(datatext.length)

        res.send(mergedArray)



        // imgelements2.each((index, element) => {
        //   const contentimg2 = element
        //   // colleteddata()
        //   imagearr.push(contentimg2)




        // });

      })

      .catch(error => {
        console.error('Error fetching the website:', error.message);
      });
  } catch (error) {
    console.error(error);
  }
}

export default {
  registerload,
  register,

  login,
  logout,
  loaddashboard,
  gnewstoday,
  newspage,
  indiatoday,
  imgslider
}