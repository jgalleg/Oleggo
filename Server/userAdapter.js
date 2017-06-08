"use strict"

const Q = require('q')
const db = require('./db.js')


var addNewUser = function(user) {
    var deferred = Q.defer()
    var query1 = "INSERT into users SET reg_ts = UNIX_TIMESTAMP(), ?"

    db.query(query1, user)

    .then(function(results) {
        deferred.resolve(results.insertId)
    })

    .fail(function(error) {
        deferred.reject(error)
    })

    return deferred.promise
}

var getUser = function(id,user) {

    var deferred = Q.defer()
    var query, data

    if(id) {
        query = "SELECT * from users WHERE id = ?"
        data = id
    }
    else if(user) {
        query = "SELECT * from users WHERE user = ?"
        data = user
    }

    else {
        deferred.reject(new Error("Invalid arguments"))
        return deferred.promise;
    }

    db.query(query, data)

    .then(function(results) {
        if(results.length >= 1)
            deferred.resolve(results[0])
        else
            deferred.resolve(null)
    })

    .fail(function(error) {
       deferred.reject(error)
    })

    return deferred.promise
}

var updateUserToken = function(id, token) {

    var deferred = Q.defer()

    if(!id || !token)
        deferred.reject(new ReferenceError("Invalid arguments"))

    var query = "UPDATE users SET token=?, token_ts=UNIX_TIMESTAMP() WHERE id=?"

    db.query(query, [token, id])

    .then(function(results) {
        deferred.resolve(results.affectedRows === 1)
    })

    .fail(function(error) {
        deferred.reject(error)
    })

    return deferred.promise
}

var updateUser = function(id, user) {
    var deferred = Q.defer()

    if(!id || !user)
        deferred.reject(new ReferenceError("Invalid arguments"))

    var values = []
    values.push(user)

    var query = "UPDATE users SET ? "


    /*if(user.city) {
        values.push(user.city.name)
        query += ", city_user = ?"
        delete user.city
    }*/

    values.push(id)
    query += "WHERE id = ?"

    db.query(query, values)

    .then(function(results) {
        deferred.resolve(results.affectedRows === 1)
    })

    .catch(function(error) {
        deferred.reject(error)
    })

    return deferred.promise
}


module.exports = {}

module.exports.getUser = getUser
module.exports.addNewUser = addNewUser
module.exports.updateUserToken = updateUserToken
module.exports.updateUser = updateUser
