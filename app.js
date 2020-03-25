const bodyParser = require('body-parser');
const multer = require('multer');
var express  = require('express');
var session = require('express-session');
var handlebars = require('express-handlebars');
require('dotenv').config();
var path = require('path');
const fs = require('fs');
var uuid = require('uuid');
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// express
var app = express();
 
// express-handlebars
app.engine('.hbs', handlebars({defaultLayout: 'default', extname: '.hbs'}));
app.set('view engine', '.hbs');
 
app.use(session({
    secret: 'cydrex',
    resave: false,
    saveUninitialized: false
}));

// static content
app.use(passport.initialize());
app.use(passport.session());  
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')));
app.use("/bootstrap", express.static(path.join(__dirname, '/node_modules/bootstrap-material-design/dist')));
app.use("/popper", express.static(path.join(__dirname, '/node_modules/popper.js/dist')));
app.use("/jquery", express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use("/img", express.static(path.join(__dirname, '/public/img')));
var demopath = path.resolve(__dirname,'demos');
app.use("/demos", express.static(path.join(__dirname, '/demos')));
app.use("/audiojs", express.static(path.join(__dirname, 'audiojs')));
app.use(express.static(demopath));
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

//multer
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, './demos');
  },
  filename: function (req, file, cb) {
      const id = uuid.v4(),
          filename = id + file.originalname;

      return cb(null , filename);
  }
});
var upload = multer({storage: storage});

// requires the model with Passport-Local Mongoose plugged in
const User = require('./models/userdb');

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//db shiz
const database = require('./models/Demo.js');
const SignupCode = require('./models/signupCode.js');



//upload demo
app.post('/upload', upload.single('demo'), function (req, res) {
  console.log(req.file);
  const demo = new database({ 
      name: req.body.name,
      title: req.body.title,
      genre: req.body.genre,
      demo: req.body.demo,
      demopath: req.file.filename
  });

  demo.save((error, result) => {
      if(error) {
          return next(err);
      }

      res.redirect('uploadSuccess');
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

//list unapproved demos
app.get('/getDemos', ensureAuthenticated, function (req, res, next)  {
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
        const filePath = path.join(__dirname, './demos/' + data.demopath);
        console.log(filePath);
          fs.unlink(filePath, function(err) {
              if(err) {
                  console.log(err);
                  return;
              } else {
                  console.log("Deleted");
                  res.redirect("/getDemos");
              }
          });
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
      res.redirect('/getDemos');
    }
  });
});

//register
app.post('/register', function(req, res, next) {
  const username = req.body.username,
      password = req.body.password,
      registercode = req.body.registercode;
  SignupCode.findOne({ pin: registercode, active: true }, function(err, data) {
      if (err) {
          console.log(err);
      } else {
        SignupCode.updateOne({ pin: registercode }, { $set: { active: false } }, function(err,data) {
              if (err) {
                  console.log(err);
              } else {
                  User.register(new User({ username: username }), password, function(err, user) {
                      if (err) {
                          console.log(err)
                      } else {
                          console.log('user registered!');

                          res.redirect('/getDemos');  
                      }
                  });
              }
          });
      }
  });
});

//login
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
    res.redirect('/getDemos');
  });

//logout
app.get('/logout', function(req, res) {
  req.logout();
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