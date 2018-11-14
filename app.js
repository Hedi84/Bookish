const importbook = require('./Book.js');
const importUser = require('./Library_user.js');
const importLoan = require('./Loan.js');
const userRepo = require('./userRepo.js')
const tokenHelper = require('./tokenHelper.js')
const express = require('express')
const app = express()
const port = 3000
const SQL = require('sql-template-strings')
var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://Bookish:softwire@localhost:5432/Bookish');
const router = express.Router();
// var passport = require('passport');
// var passportjwt = require('passport-jwt');
// // var jwt = require('jsonwebtoken');
// var token = jwt.sign();

app.use('/', express.static('frontend'))

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

router.post('/login', (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  if (!username || !password) {
    res.status(400).send({errors: ['Query params must contain both `username` and `password`']})
  } else {
    return userRepo.doesUserExist(username, password)
      .then (result => {
        if (result === true) {
          res.status(200).send({
            message: `Welcome, ${username}!`,
            token: tokenHelper.createTokenForUser(username)
          })
        } else {
          res.status(400).send({errors: ['Unable to match username and password to a valid user']})
        }
      })
  }
})

router.use((req, res, next) => {
  const token = req.headers['x-access-token'];
  console.log("request");
  if (tokenHelper.isTokenValid(token)) {
    console.log("valid");
    next();
  } else {
    console.log("not valid");
    return res.status(403).send({
      success: false,
      message: 'Invalid token'
  });
  }
})

app.use(router);

app.get('/dosomething', function (req, res) {
  var x = "5";
  res.send(x);
})






app.get('/books', function(req, res){
  let data = db.any('SELECT * FROM book')
    return data
    .then(output => {
      var array = createBookObject(output)
      // console.log(array)
      res.send(array)
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

app.get('/loans', function(req, res){
  let data = db.any('SELECT * FROM loan')
    return data
    .then(output => {
      var array = createLoan(output)
      // console.log(array)
      res.send(array);
    })
})

app.get('/book/:id', function(req, res){
  var id = req.params.id;
  let data = db.any(SQL `SELECT * FROM book WHERE book.id =${id}`)
  let results = []
  return data
  .then(output => {
    results.push(output[0])
    let arrayOfLoans = findLoanByBookId(output[0].id)
    return arrayOfLoans;
  })
  .then(result => {
    result.forEach(function(loan){
      results.push(loan)
    })
    res.send(results)
  })
})

function findLoanByBookId(id) {
  let loans = [];
  var number = Number(id)
  let data = db.any(SQL `SELECT * FROM loan WHERE book_id = ${number}`)
    return data
    console.log(data)
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
          loans.push(book)
      })
      return loans;
    })
  return data
}


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

function createLoan (array) {
  var loans = [];
  array.forEach(function(loan) {
    let loany = new importLoan.Loan(library_user_id = loan.library_user_id, book_id = loan.book_id)
    loans.push(loany);
  })
  return loans;
}

function alphabetize(array) {
  if (array[0].library_username !== undefined) {
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
