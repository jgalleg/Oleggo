"use strict"

const express = require('express')
const crypto = require('crypto')
const Q = require('q')
const HTTPError = require('./common.js').HTTPError
const adapter = require('./userAdapter.js')
const userVars = require("./common.js").userVars


const TOKEN_LENGTH = 64
const TOKEN_LIFE = 7 * 24 * 3600

const PASSWORD_LENGTH_MAX = 64

const PBKDF2_ITERATIONS = 1000           // *** TODO TO BE CHANGED FOR PRODUCTION HARDWARE ***
const SALT_HEX_LENGTH = 64
const PASSWORD_HASH_HEX_LENGTH = 64


const router = express.Router()


function saltHashPassword(password) {
    var deferred = Q.defer()

    crypto.randomBytes(SALT_HEX_LENGTH / 2, function(error, bytes) {

        if(error)
            deferred.reject(error)
        else {
            var salt = bytes.toString("hex")
            crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PASSWORD_HASH_HEX_LENGTH / 2,
                  "sha512", function(error, key) {
                if(error)
                    deferred.reject(error)
                else
                    deferred.resolve(key.toString("hex") + salt)
            })
        }
    })
    return deferred.promise
}

function validatePassword(password, storedHash) {
    var deferred = Q.defer()

    if(!password)
        deferred.reject(new ReferenceError("Invalid password"))

    if(storedHash.length != PASSWORD_HASH_HEX_LENGTH + SALT_HEX_LENGTH)
        deferred.reject(new RangeError("Invalid hash"))


    var hash = storedHash.slice(0, PASSWORD_HASH_HEX_LENGTH)
    var salt = storedHash.slice(PASSWORD_HASH_HEX_LENGTH)


    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PASSWORD_HASH_HEX_LENGTH / 2,
                 "sha512", function(err, key) {
        if(err)
            deferred.reject(err)
        else
            deferred.resolve(key.toString("hex") === hash)
    })

    return deferred.promise
}

/* Put as a middleware before authenticated requests. It writes the user field in res.locals,

   for next function convenience */

var validateBodyToken = function(req, res, next) {

    try {
        if(!req.body)
            throw new HTTPError(400, "Empty request body")

        if(!req.body.token || req.body.token.length <= TOKEN_LENGTH)
            throw new HTTPError(401, "Invalid token")

        var userID = parseInt(req.body.token.slice(TOKEN_LENGTH), 10)
        if(!userID || userID === NaN)
            throw new HTTPError(401, "Invalid token")

        adapter.getUser(userID, null)

        .then(function(user) {
            if(!user)
                throw new HTTPError(401, "Invalid token")

            var token = req.body.token.slice(0, TOKEN_LENGTH)

            if(user.token === token) {
                if(Date.now() / 1000 - user.token_ts >= TOKEN_LIFE)
                    throw new HTTPError(403, "Token expired")
                else
                {
                    res.locals.user = user
                    next(res)
                }
            }
            else
                throw new HTTPError(401, "Invalid token")
        })


        .fail(function(error) {
             next(error)
        })
    }
    catch(error) {
            next(error)
    }
}

router.post("/signup", function (req, res, next) {

    try {
        console.log("signup request as %s", req.body.name)

        if(!req.body)
            throw new HTTPError(400)
        if(!req.body.name || !req.body.password|| !req.body.user )
            throw new HTTPError(400, "Missing required field")
        if(req.body.name.length === 0 || req.body.name.length > userVars.NAME_LENGTH_MAX)
            throw new HTTPError(400, "Invalid user")
        if(req.body.user.length === 0 || req.body.user.length > userVars.USER_LENGTH_MAX)
                throw new HTTPError(400, "Invalid name")
        if(req.body.password.length === 0 || req.body.password.length > PASSWORD_LENGTH_MAX)
            throw new HTTPError(400, "Invalid password")

        var u = { user:req.body.user,
                  name: req.body.name }

        saltHashPassword(req.body.password)

        .then(function(storedPassword) {
            u.password = storedPassword
            return adapter.addNewUser(u)
        })

        .then(function() {
            console.log("User " + " signed up")
            res.status(200).end()
        })


        .fail(function(error) {
            if(error.code ===  "ER_DUP_ENTRY")
                res.status(401).json({ error: "User already exists" })
            else
                next(error)
        })
	}
	catch(err) {
        next(err)
	}
})

router.post("/login", function (req, res, next) {

	try {
        console.log("login request from %s", req.body.user)
        //console.log(JSON.stringify(req.body))
		if(!req.body)
			throw new HTTPError(400, "Invalid body")


        if(!req.body.user || !req.body.password)
                throw new HTTPError(400, "Invalid request body")

		var user = req.body.user
        var token = null

        adapter.getUser(null, user)

        .then(function(dbUser) {

            if(!dbUser)
                throw new HTTPError(401, "Invalid username or password")
            else {
                user = dbUser
                return validatePassword(req.body.password, user.password)
            }
        })

        .then(function(validPassword) {
            if(!validPassword)
                throw new HTTPError(401, "Invalid username or password")
            else {
                var deferred = Q.defer()
                crypto.randomBytes(Math.ceil((TOKEN_LENGTH * 3 / 4)),

                function(error, bytes) {
                    if(error)
                        deferred.reject(error)
                    else {
                        token = bytes.toString('base64').slice(0, TOKEN_LENGTH)
                        deferred.resolve()
                    }
                })
                return deferred.promise
            }
        })

        .then(function() {
            return adapter.updateUserToken(user.id, token)
        })

        .then(function(tokenUpdated) {
            if(!tokenUpdated) {
                throw new Error("Unable to update token")
            }
            else {
                if(user.first_login === 1)
                    return adapter.updateUser(user.id, { first_login : 0 })
                else
                    return Q.resolve()
            }
        })

        .then(function() {
            token += user.id.toString(10)
            let response = { token : token }
            res.status(200).json(response)
            //if(user.first_login === 1)
        })

        .fail(function(error) {
            next(error)
        })
	}
	catch(error) {
        next(error)
	}
})

router.post("/testtoken", function (req, res, next) {

    if(!req.body)
        throw new HTTPError(400, "Invalid body")

    console.log("/testtoken request from %s", req.body.name)
    console.log(JSON.stringify(req.body))
    res.status(200).end()
})


module.exports = {}
module.exports.router = router
module.exports.validateBodyToken = validateBodyToken
