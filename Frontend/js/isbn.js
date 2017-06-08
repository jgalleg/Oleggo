
var isbn = require('node-isbn');
isbn.resolve('9780545010221', function (err, book) {
    if (err) {
        console.log('Book not found', err);
    } else {
        console.log('Book found %j', book);
    }
});
