const SQL = require('sql-template-strings');
var pgp = require('pg-promise')(/*options*/);
var db = pgp('postgres://Bookish:softwire@localhost:5432/Bookish');

function doesUserExist(username, password) {
  let data = db.any(SQL `SELECT * FROM library_user WHERE library_username= ${username} AND library_password=${password}`)
  return data
    .then(result => {
      return didItFindUser(result, username);
    })
}


function didItFindUser (array, username) {
    if (array.length > 0) {
      return true
    } else {
      return false
    }
  }


exports.doesUserExist = doesUserExist;
