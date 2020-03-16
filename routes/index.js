var express = require('express');
var router = express.Router();
 
// views/index.hbs 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Frontpage' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'register' });
});

router.get('/uploadFiles', function(req, res, next) {
  res.render('uploadFiles', { title: 'upload your files' });
});

router.get('/demos', function(req, res, next) {
  res.render('demos', { title: 'Submitted demos' });
});

router.get('/uploadSuccess', function(req, res, next) {
  res.render('uploadSuccess', { title: 'Upload was succesful!!' });
});

module.exports = router;