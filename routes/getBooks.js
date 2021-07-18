module.exports = {
    getBooks(req) {
        return req.app.db.get("books")
    },
    getBook(req, bookInfo) {
        return req.app.db.get("books").find(bookInfo).value()
    },

}