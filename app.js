const importbook = require('./Book.js');
const express = require('express')
const app = express()
const port = 3000
var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://Bookish:softwire@localhost:5432/Bookish')

// db.any('INSERT INTO public.library_user(library_username, library_password) VALUES($1, $2)', ['John', 'Doe2'])
//     .then(() => {
//         console.log("added");
//     })
//     .catch(error => {
//         console.log(error);
//     });
    //

// app.use(express.static('frontend'))

app.get('/', function(req, res){
    let data = db.any('SELECT * FROM book')
    return data
    .then(output => {
      var array = createBookObject(output)
      // console.log(array)
      res.send(array);
    })
})

function createBookObject(array) {
  var books = []
  array.forEach(function(book) {
  let bookie = new importbook.Book(author = book.author, title = book.title, isbn = book.isbn, copies = book.copies)
    books.push(bookie);
  })
  // console.log(books)
  var alphaBooks = alphabetize(books);
  // console.log(".......................");
  console.log(alphaBooks);
  return alphaBooks;
}

function alphabetize(array) {
  array.sort(function(a, b){
  if(a.title.toUpperCase() < b.title.toUpperCase()) { return -1; }
  if(a.title.toUpperCase() > b.title.toUpperCase()) { return 1; }
  return 0;
  })
  return array;
}
// })

// app.get('/', (req, res) => res.send('Hello World!'))
// app.get('/all', function(req, res){
//
//     })
// })


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
