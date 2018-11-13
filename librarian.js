const loanImport = require('./Loan.js');
const SQL = require('sql-template-strings')
var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://Bookish:softwire@localhost:5432/Bookish')

// fetch user and check loans




function fetchUser (username) {
    return new Promise(function(resolve, reject){
      var data = db.any(SQL `SELECT * FROM library_user WHERE library_username=${username}`)
      resolve(data)
    })
}



function fetchBook (bookTitle) {
    return new Promise(function(resolve, reject){
      var data = db.any(SQL `SELECT * FROM book WHERE title=${bookTitle}`)
      resolve(data)
    })
}

function getStuff(bookTitle, username) {
  var array = []
  return fetchBook(bookTitle)
  .then (result => {
    array.push(result[0])
    return fetchUser(username)
      .then (result => {
        array.push(result[0])
      }).then (result => {
        assignBooks(array)
      })
    })
 }

function assignBooks (array) {
  console.log(array[0].copies)
  if (array[0].copies > 0) {
    array[0].copies -= 1;
    var loan =  new loanImport.Loan(array[0].id, array[1].id);
    console.log(array[0].copies)
    return loan
  } else {
    return "no more copies of that, yo."
  }
}

getStuff('badgers', 'Sarah');


// view individual users and checked out books
