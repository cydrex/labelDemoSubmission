const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
var express  = require('express');
var handlebars = require('express-handlebars');
require('dotenv').config();
var path = require('path');
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;




// requires the model with Passport-Local Mongoose plugged in
const User = require('./models/userdb');

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// express
var app = express();
 
// express-handlebars
app.engine('.hbs', handlebars({defaultLayout: 'default', extname: '.hbs'}));
app.set('view engine', '.hbs');


 
// static content
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')));
app.use("/bootstrap", express.static(path.join(__dirname, '/node_modules/bootstrap-material-design/dist')));
app.use("/popper", express.static(path.join(__dirname, '/node_modules/popper.js/dist')));
app.use("/jquery", express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use("/img", express.static(path.join(__dirname, '/public/img')));

//db shiz
const database = require('./models/database.js');
//upload demo
app.post('/upload', function (request, response, next) {
  const demo = new database({ 
    name: request.body.name,
    title: request.body.title,
    genre: request.body.genre,
    link: request.body.link
  })
  demo.save((error, result) => {
    if(error) {
        return response.status(500).send(error);
    }
    response.redirect('uploadSuccess');
  });
});

//list unapproved demos
app.get('/getDemos', function (req, res)  {
  database.find({ approved: false }).then(unapproved => {
    database.find({ approved: true }).then(approved => {
        res.render('demos', {
             approved: approved,
                 unapproved: unapproved
        });
    }).catch(error => {
        console.log(error);
    });
  }).catch(error => {
    console.log(error);
   });
});

//delete from db
app.post('/delete/:id', function(req,res) {
  console.log(req.params);
  database.findOneAndRemove({_id: req.params.id}, function(err,data) {
      if(err) {
          console.log(err);
      } else {
          console.log("Deleted");
          res.redirect("/getDemos");
      }
  });
});

//approve track
app.post('/approve/:id', function(req,res) {
  console.log(req.params);
  database.updateOne({ _id: req.params.id }, { $set: { approved: true } }, (err2, result) => {
    if (err2) {
      console.log(err, result);
      res.redirect("/error");
    } else {
      console.log('approved!');
      res.redirect('getDemos');
    }
  });
});

//register
app.post('/register', function(req, res, next) {
  const username = req.body.username,
      password = req.body.password;
  User.register(new User({ username: username }), password, function(err, user) {
    if (err) { console.log(err)
    } else {


    console.log('user registered!');

    res.redirect('/getDemos');  
    }
  });
});

//login     fix ('username', 'password', 
app.get('/login', function(req, res) {
  res.render('login', {user: req.user});
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res) {
    res.redirect('/');
  });

//database connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to database'))

// routes
var routes = require('./routes/index');
app.use('/', routes);

// server
app.listen(3000, function(){
  console.log('Application is open in localhost:3000.');
});