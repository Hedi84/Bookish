const moment = require('moment');
const date = new Date
class Loan {
  constructor (library_user_id, book_id, checkout_date, due_date) {
      this.library_user_id = library_user_id,
      this.book_id = book_id,
      this.checkout_date = moment(date).format("MMM Do YY"),
      this.due_date = moment(moment(date).add(7, 'days').calendar()).format("MMM Do YY")
  }
}

exports.Loan = Loan
