const importbook = require('./Book.js');
const importUser = require('./Library_user.js');
const express = require('express')
const app = express()
const port = 3000
const SQL = require('sql-template-strings')
var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://Bookish:softwire@localhost:5432/Bookish')
// var passport = require('passport');
// var passportjwt = require('passport-jwt');
// // var jwt = require('jsonwebtoken');
// var token = jwt.sign();


// passport.use(new BasicStrategy(
//   function(username, password, done) {
//     db.any{'SELECT * FROM library_user WHERE library_username='username' '}, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) { return done(null, false); }
//       if (!user.validPassword(password)) { return done(null, false); }
//       return done(null, user);
//     });
//   }
// ));



app.get('/', function(req, res){
  let data = db.any('SELECT * FROM book')
    return data
    .then(output => {
      var array = createBookObject(output)
      // console.log(array)
      res.send(array);
    })
})


app.get('/users', function(req, res){
  let data = db.any('SELECT * FROM library_user')
    return data
    .then(output => {
      var array = createUser(output)
      // console.log(array)
      res.send(array);
    })
})

app.get('/user/:id', function(req, res){
  var array = []
  var id = req.params.id;
  return user(id)
    .then(output => {
      array.push(output)
      return findLoans(id)
    })
    .then(result => {
      array.push(result)
    })
    .then(() => {
      console.log(array)
      res.send(array);
    })
});

function user(id) {
  let data = db.any(SQL`SELECT * FROM library_user WHERE library_user.id =${id}`)
    return data
}

function findLoans(user_id) {
  let books = []
  var number = Number(user_id)
  let data = db.any(SQL `SELECT * FROM loan WHERE library_user_id = ${number}`)
    .then(result => {
      let promises = []
      console.log("finding book titles")
      result.forEach(function(loan){
        promises.push(findBookTitlebyID(loan.book_id))
      })
      return Promise.all(promises)
    })
    .then(result => {
        result.forEach(function(book){
          books.push(book)
      })
      console.log(books)
      return books;
    })
  console.log(data)
  return data
}

function findBookTitlebyID(id) {
  let books = db.any(SQL `SELECT * FROM book WHERE id = ${id}`)
  return books
}
// app.get('/me',
//   passport.authenticate('basic', { session: false }),
//   function(req, res) {
//     res.json({ id: req.library_user.id, username: req.library_user.library_username, password: req.library_user.library_password });
//   });

function createUser(array) {
  var users = []
  array.forEach(function(user) {
  let person = new importUser.Library_user(library_username = user.library_username, library_password = user.library_password)
    users.push(person);
  })
  var alphaUsers = alphabetize(users);
  // console.log(alphaUsers);
  return alphaUsers;
  // return users
}


function createBookObject(array) {
  var books = []
  array.forEach(function(book) {
  let bookie = new importbook.Book(author = book.author, title = book.title, isbn = book.isbn, copies = book.copies)
    books.push(bookie);
  })
  var alphaBooks = alphabetize(books);
  return alphaBooks;
}

function alphabetize(array) {
  if (array[0].library_username !== null) {
    array.sort(function(a, b){
      if(a.library_username.toUpperCase() < b.library_username.toUpperCase()) { return -1; }
      if(a.library_username.toUpperCase() > b.library_username.toUpperCase()) { return 1; }
    return 0;
  });
  } else {
    array.sort(function(a, b){
    if(a.title.toUpperCase() < b.title.toUpperCase()) { return -1; }
    if(a.title.toUpperCase() > b.title.toUpperCase()) { return 1; }
    return 0;
    })
  }
  return array;
}





app.listen(port, () => console.log(`Example app listening on port ${port}!`))
