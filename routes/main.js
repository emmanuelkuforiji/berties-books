module.exports = function(app, fighterData) {
  const request = require('request');
  const { check, validationResult } = require('express-validator');
  const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('./login')
    } else { next (); }
}

    const bcrypt = require('bcrypt');

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', fighterData);
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', fighterData);
    });
    app.get('/search',function(req,res){
        res.render("search.ejs", fighterData);
    });
    app.get('/search-result', function (req, res) {
      let sqlQuery = "SELECT * FROM fighters";
      let queryConditions = [];
      let queryParameters = [];
  
      if (req.query.forename) {
          queryConditions.push("forename LIKE ?");
          queryParameters.push('%' + req.query.forename + '%');
      }
      if (req.query.surname) {
          queryConditions.push("surname LIKE ?");
          queryParameters.push('%' + req.query.surname + '%');
      }
      if (req.query.minAge && req.query.maxAge) {
        queryConditions.push("age BETWEEN ? AND ?");
        queryParameters.push(req.query.minAge, req.query.maxAge);
      } else if (req.query.minAge) {
        queryConditions.push("age >= ?");
        queryParameters.push(req.query.minAge);
      } else if (req.query.maxAge) {
        queryConditions.push("age <= ?");
        queryParameters.push(req.query.maxAge);
      }
      if (req.query.minFights && req.query.maxFights) {
        queryConditions.push("fights BETWEEN ? AND ?");
        queryParameters.push(req.query.minFights, req.query.maxFights);
      } else if (req.query.minFights) {
        queryConditions.push("fights >= ?");
        queryParameters.push(req.query.minFights);
      } else if (req.query.maxFights) {
        queryConditions.push("fights <= ?");
        queryParameters.push(req.query.maxFights);
      }
      if (req.query.minWins && req.query.maxWins) {
        queryConditions.push("wins BETWEEN ? AND ?");
        queryParameters.push(req.query.minWins, req.query.maxWins);
      } else if (req.query.minWins) {
        queryConditions.push("wins >= ?");
        queryParameters.push(req.query.minWins);
      } else if (req.query.maxWins) {
        queryConditions.push("wins <= ?");
        queryParameters.push(req.query.maxWins);
      }
      if (req.query.minLosses && req.query.maxLosses) {
        queryConditions.push("losses BETWEEN ? AND ?");
        queryParameters.push(req.query.minLosses, req.query.maxLosses);
      } else if (req.query.minLosses) {
        queryConditions.push("losses >= ?");
        queryParameters.push(req.query.minLosses);
      } else if (req.query.maxLosses) {
        queryConditions.push("losses <= ?");
        queryParameters.push(req.query.maxLosses);
      }
      if (req.query.minDraws && req.query.maxDraws) {
        queryConditions.push("draws BETWEEN ? AND ?");
        queryParameters.push(req.query.minDraws, req.query.maxDraws);
      } else if (req.query.minDraws) {
        queryConditions.push("draws >= ?");
        queryParameters.push(req.query.minDraws);
      } else if (req.query.maxDraws) {
        queryConditions.push("draws <= ?");
        queryParameters.push(req.query.maxDraws);
      }
      if (req.query.minWeight && req.query.maxWeight) {
        queryConditions.push("weight BETWEEN ? AND ?");
        queryParameters.push(req.query.minWeight, req.query.maxWeight);
      } else if (req.query.minWeight) {
        queryConditions.push("weight >= ?");
        queryParameters.push(req.query.minWeight);
      } else if (req.query.maxWeight) {
        queryConditions.push("weight <= ?");
        queryParameters.push(req.query.maxWeight);
      }
    
    // Only add 'WHERE' if there are conditions
    if (queryConditions.length > 0) {
      sqlQuery += " WHERE " + queryConditions.join(' AND ');
  } else {
      // If no search criteria, return an empty result
      return res.render("list.ejs", { promotionName: "Instant Smoke Promotions", availableFighters: [] });
  }

  // Debugging: Log the final SQL query and parameters
  console.log("SQL Query:", sqlQuery);
  console.log("Parameters:", queryParameters);

  // Execute SQL query with parameterized input
  db.query(sqlQuery, queryParameters, (err, result) => {
      if (err) {
          console.error(err.message); // Log the error
          res.redirect('./'); // Redirect on error
      } else {
          let newData = Object.assign({}, fighterData, { availableFighters: result });
          console.log(newData);
          res.render("list.ejs", newData);
          }
      });        
  });
  
    app.get('/register', function (req,res) {
        res.render('register.ejs', fighterData);                                                                     
    });                                                                                                 
    app.post('/registered', [check('email').isEmail()], check('password').isLength({min: 8}), function (req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.redirect('./register'); 
      }
      else {
      const saltRounds = 10;
      const plainPassword = req.body.password;
      bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
          // Store hashed password in your database.
          let sqlquery = "INSERT INTO user (username, plainpassword, password, firstname, lastname, email) VALUES (?,?,?,?,?,?)";
          // execute sql query
          let newrecord = [req.body.username, req.body.password, hashedPassword, req.body.first, req.body.last, req.body.email];
          db.query(sqlquery, newrecord, (err, result) => {
          if (err) {
            return console.error(err.message);
          }
          else{
             res.send(' The user: '+ req.body.username + ' has been created');
          }
        });
      });
      } 
    });

    app.get('/login', function (req,res) {
        res.render('login.ejs', fighterData);                                                                     
    });                                                                                                 
    app.post('/loggedin', function (req, res) {
      let bcrypt = require('bcrypt');
      let sqlquery = "SELECT password FROM user WHERE username = ?";
      let username = req.body.username;
      db.query(sqlquery, username, (err, result) => {
          if (err) {
              console.error(err);
          } else {
              if (result.length > 0) {
                  bcrypt.compare(req.body.password, result[0].password, function(err, bcryptResult) {
                      if (err) {
                          console.log(err);
                          // Handle bcrypt error
                      } else if (bcryptResult) {
                          // Save user session here, when login is successful
                          req.session.userId = username;
                          res.send('Logged in! <a href="./">home</a>');
                      } else {
                          // Render login page with incorrect credentials message
                          res.render('login.ejs', {
                              promotionName: fighterData.promotionName,
                              message: "Username or Password incorrect. Please try again."
                          });
                      }
                  });
              } else {
                  // Render login page with user not found message
                  res.render('login.ejs', {
                      promotionName: fighterData.promotionName,
                      message: "Username not found. Please try again."
                  });
              }
          }
      });
  });
    
    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    })

    app.get('/list', function(req, res) {
        let sqlquery = "SELECT * FROM fighters"; // query database to get all the fighters
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, fighterData, {availableFighters:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });
    });

    app.get('/listusers', redirectLogin, function(req, res) {
        let sqlquery = "SELECT * FROM user"; // query database to get all the users
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, fighterData, {availableUser:result});
            console.log(newData)
            res.render("listusers.ejs", newData)
         });
    });

    app.get('/addfighter', redirectLogin, function (req, res) {
        res.render('addfighter.ejs', fighterData);
     });
 
     app.post('/fighteradded', function (req,res) {
           // saving data in database
           let sqlquery = "INSERT INTO fighters (forename, surname, age, fights, wins, losses, draws, weight) VALUES (?,?,?,?,?,?,?,?)";
           // execute sql query
           let newrecord = [req.body.forename, req.body.surname, req.body.age, req.body.fights, req.body.wins, req.body.losses, req.body.draws, req.body.weight];
           db.query(sqlquery, newrecord, (err, result) => {
             if (err) {
               return console.error(err.message);
             }
             else
             res.send(' The Fighter: '+ req.body.forename + ' '+ req.body.surname + ' has been added to the database');
             });
       });    

       app.get('/heavyweights', function(req, res) {
        let sqlquery = "SELECT * FROM fighters WHERE weight > 200";
        db.query(sqlquery, (err, result) => {
          if (err) {
             res.redirect('./');
          }
          let newData = Object.assign({}, fighterData, {availableFighters:result});
          console.log(newData)
          res.render("heavyweights.ejs", newData)
        });
      });

      // Display the form on GET request
      app.get('/weather', function (req, res) {
          res.render('weather');
      });

      // Process the form and display weather on POST request
      app.post('/weather', function (req, res) {
          let apiKey = 'cdc24913279078ab8d38d9cd4b6e0963';
          let city = req.body.city; // get city from POST request body
          let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
          
          request(url, function (err, response, body) {
              if (err) {
                  console.log('error:', err);
                  res.send('Error occurred while fetching weather data.');
              } else {
                  let weather = JSON.parse(body);
                  if(weather.main) {
                      let wmsg = 'It is ' + weather.main.temp +
                          ' degrees in ' + weather.name +
                          '! <br> The humidity now is: ' +
                          weather.main.humidity;
                      res.send(wmsg);
                  } else {
                      res.send('Unable to find weather data for the specified city.');
                  }
              }
          });
      });     

}
