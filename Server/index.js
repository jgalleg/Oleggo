const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const https = require('https')
const crypto = require('crypto')
const reports = require('./reports.js')

const C = require('./common.js')
const HTTPError = require('./common.js').HTTPError
const db = require('./db.js')
const user = require('./user.js')

const HTTP_PORT = 8080
const HTTPS_PORT = 8081

const BODY_SIZE_MAX = 5000000
const TOKEN_LENGTH = 64

var httpd = express()

var errorHandler = function(err, req, res, next) {
    try {
        if(err instanceof SyntaxError) {
            console.error("Error while parsing request body -", err.message)
            res.status(400).json({ error: "Invalid request body!"})
        }
        else if(err instanceof HTTPError)
            res.status(err.code).json({ error : err.message })
        else {
            console.error(err.stack || err.message)
            res.status(500).end()
        }
    }
    catch(badError) {
        console.error(badError.stack || badError.message)
        res.status(500).end()
    }
}

var JSONParser = bodyParser.json({ limit: BODY_SIZE_MAX })

db.init().then(function() {
    try {
        httpd.use("/", JSONParser, user.router)
        httpd.use("/report", JSONParser, user.validateBodyToken, reports.router)
        httpd.all("*", function(req, res) {
            res.status(404).send("404 Not found")
        })

        httpd.use(errorHandler)

        http.createServer(httpd).listen(HTTP_PORT)
        https.createServer(httpd).listen(HTTPS_PORT)
        console.log("Oleggo server started on ports " + HTTP_PORT + " and " + HTTPS_PORT)
    }
    catch(error) {
        console.error("Unable to init server -", error.message)
        process.exit(1)
    }
},
function(error) {
    console.error("Unable to init DB -", error.message)
    process.exit(2)
})
