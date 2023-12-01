module.exports = function(app, fighterData) {
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
      if (req.query.age) {
        queryConditions.push("age = ?");
        queryParameters.push(req.query.age);
      }
      if (req.query.fights) {
        queryConditions.push("fights = ?");
        queryParameters.push(req.query.fights);
      }
      if (req.query.wins) {
        queryConditions.push("wins = ?");
        queryParameters.push(req.query.wins);
      }
      if (req.query.losses) {
        queryConditions.push("losses = ?");
        queryParameters.push(req.query.losses);
      }
      if (req.query.draws) {
        queryConditions.push("draws = ?");
        queryParameters.push(req.query.draws);
      }
      if (req.query.weight) {
        queryConditions.push("weight = ?");
        queryParameters.push(req.query.weight);
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
    app.post('/loggedin', function (req,res) {
        let bcrypt = require('bcrypt')
        let sqlquery = "SELECT password FROM user WHERE username = ?";
        let newData = req.body.username;
        db.query(sqlquery, newData, (err, result) => {
            if (err) {
                 console.error(err);
              }
            else{
                console.log(result);
                bcrypt.compare(req.body.password, result[0].password, function(err, result) {
                    if (err) {
                      // TODO: Handle error
                      console.log(err);
                    }
                    else if (result == true) {  
                    // Save user session here, when login is successful
                    req.session.userId = req.body.username;
                    // TODO: Send message
                    res.send('Logged in! <a href = ' + './' + '>home</a>');
                    }
                    else {
                      // TODO: Send message
                      res.send('Username or Password incorrect <a href = ' + './' + '>home</a>');
                    }
                  });
            }
           })

        
        })
    
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

}
