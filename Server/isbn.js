"use strict"
const express = require('express')
const crypto = require('crypto')
const Q = require('q')
const HTTPError = require('./common.js').HTTPError
const isbn = require('node-isbn')
const user = require('./user.js')


const router = express.Router()


router.post("/isbn", (req, res) => {
        var status = req.body
        if(!status || !status.user || !status.token || !status.isbn)
           throw new HTTPError(400, "Invalid request")

        user.validateBodyToken(req,res,function(error){

            throw new HTTPError(error.code,error.message)
        })

        console.log("book code: "+ status.isbn + " search from: " + status.user)
        isbn.resolve(status.isbn, function (err, book) {
            if (err) {
                console.log('Book not found' + err)
                res.status(200).json("book not found")
            } else {
                console.log('Book found' + book.title)
                res.status(200).json(book)
            }
        })
})


module.exports = {}
module.exports.router = router
