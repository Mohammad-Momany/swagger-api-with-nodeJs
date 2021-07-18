const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const { getBooks, getBook } = require("./getBooks");

const idLength = 8;

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The book title
 *         author:
 *           type: string
 *           description: The book author
 *       example:
 *         id: d5fE_asz
 *         title: The New Turing Omnibus
 *         author: Alexander K. Dewdney
 * 
 *     EditBook:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The book title
 *         author:
 *           type: string
 *           description: The book author
 *       example:
 *         title: The New Turing Omnibus
 *         author: Alexander K. Dewdney
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The books managing API
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Returns the list of all the books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

router.get("/", (req, res) => {
    const books = getBooks(req);

    res.send(books);
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book description by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: The book was not found
 */

router.get("/:id", (req, res) => {
    const book = getBook(req, { id: req.params.id }).value();

    try {

        if (!book) throw new Error("The book was not found")

    } catch (error) {
        return res.send(error.message).status(404)

    }

    res.send(book);
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditBook'
 *     responses:
 *       200:
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       409:
 *         description: The book is already exists
 */

router.post("/", (req, res) => {
    try {
        const book = {
            id: nanoid(idLength),
            ...req.body,
        };

        const bookId = getBook(req, { id: book.id }).value()
        const title = getBook(req, { title: book.title }).value()
        const author = getBook(req, { author: book.author }).value()

        if (bookId || (title && author)) throw Error("The book is already exists")

        getBooks(req).push(book).write();

        res.send(book)

    } catch (error) {
        return res.send(error.message).status(409);
    }
});

/**
 * @swagger
 * /books/{id}:
 *  put:
 *    summary: Update the book by the id
 *    tags: [Books]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The book id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/EditBook'
 *    responses:
 *      200:
 *        description: The book was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Book'
 *      404:
 *        description: The book was not found
 */

router.put("/:id", (req, res) => {
    try {
        const book = getBook(req, { id: req.params.id })
        if (!book) throw Error("The book was not found")
        book.assign(req.body).write();
        res.send(book);

    } catch (error) {
        return res.send(error.message).status(404);
    }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Remove the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 * 
 *     responses:
 *       200:
 *         description: The book was deleted
 *       404:
 *         description: The book was not found
 */

router.delete("/:id", (req, res) => {
    try {
        const book = getBook(req, { id: req.params.id })
        if (!book) throw Error("The book was not found")
        getBooks(req).remove({ id: req.params.id }).write();
        res.send("The book was deleted").status(200);
    } catch (error) {
        return res.send(error.message).status(404);
    }

});

module.exports = router;