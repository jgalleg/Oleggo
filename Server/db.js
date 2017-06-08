"use strict"

const mysql = require("mysql")
const Q = require("q")
const userVars = require("./common.js").userVars


const DB_NAME = "Oleggo"


const DB_USER_TABLE_FIELDS =
    "id             INT UNSIGNED              NOT NULL AUTO_INCREMENT UNIQUE, " +
    "password       CHAR(128)                                   NOT NULL,     " +
    "user           VARCHAR(" + userVars.USER_LENGTH_MAX + ")                 " +
    "CHARACTER SET ascii DEFAULT NULL UNIQUE,                                 " +
    "name           VARCHAR(" + userVars.NAME_LENGTH_MAX + ")   NOT NULL,     " +
    "token          CHAR(64)                                    DEFAULT NULL, " +
    "token_ts       BIGINT                                      DEFAULT NULL, " +
    "reg_ts         BIGINT                                      NOT NULL,     " +
    "first_login    TINYINT                                     DEFAULT 1,    " +
    "PRIMARY KEY (id)                                                         "

/*const DB_ITEMS_TABLE_FIELDS =
    "id              INT UNSIGNED                 NOT NULL AUTO_INCREMENT UNIQUE,    " +
    "title           VARCHAR(20)                                 DEFAULT NULL,       " +
    "isbn            INT UNSIGNED                                NOT NULL DEFAULT 0, " +
    "author      INT UNSIGNED                                NOT NULL DEFAULT 0, " +
    "description             CHAR(24)                                    DEFAULT NULL UNIQUE," +
    "state           INT UNSIGNED                                NOT NULL DEFAULT 0, " +
    "registration_ts BIGINT                                      NOT NULL,           " +
    "state_change_ts BIGINT                                      NOT NULL DEFAULT 0, " +
    "PRIMARY KEY (id),                                                               " +
    "INDEX user_index (user)                                                         "
*/

const DB_ITEMS_TABLE_FIELDS =
    "id              INT UNSIGNED                 NOT NULL AUTO_INCREMENT UNIQUE,    " +
    "user            VARCHAR(20)                                 DEFAULT NULL,       " +
    "type            INT UNSIGNED                                NOT NULL DEFAULT 0, " +
    "groupitem       INT UNSIGNED                                NOT NULL DEFAULT 0, " +
    "epc             CHAR(24)                                    DEFAULT NULL UNIQUE," +
    "state           INT UNSIGNED                                NOT NULL DEFAULT 0, " +
    "registration_ts BIGINT                                      NOT NULL,           " +
    "state_change_ts BIGINT                                      NOT NULL DEFAULT 0, " +
    "PRIMARY KEY (id),                                                               " +
    "INDEX user_index (user)                                                         "


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root"
})


var query = function (query, values) {
    var deferred = Q.defer()

    connection.query(query, values, function (error, results, fields) {
        if (error)
            deferred.reject(error)
        else
            deferred.resolve(results)
    })

    return deferred.promise
}


var startTransaction = function() {
    var deferred = Q.defer()

    connection.beginTransaction(function(error) {
        if(error)
            deferred.reject(error)
        else
            deferred.resolve()
    })

    return deferred.promise
}


var commitTransaction = function() {
    var deferred = Q.defer()

    connection.commit(function(error) {
        if(error)
            deferred.reject(error)
        else
            deferred.resolve()
    })

    return deferred.promise
}


var rollbackTransaction = function() {
    var deferred = Q.defer()

    connection.rollback(function(error) {
        if(error)
            deferred.reject(error)
        else
            deferred.resolve()
    })

    return deferred.promise
}


var init = function () {
    var deferred = Q.defer()

    connection.connect()

    query("SHOW SCHEMAS LIKE '" + DB_NAME + "'")

    .then(function (rows) {
        if (rows.length != 1) {
            console.log("Creating database %s", DB_NAME)
            return query("CREATE SCHEMA " + DB_NAME + " CHARACTER SET utf8mb4")
        } else
             return Q(null)
    })

    .then(query.bind(null, "USE " + DB_NAME))

    .then(query.bind(null, "SHOW TABLES LIKE 'users'"))

    .then(function (rows) {
        if (rows.length != 1) {
            console.log("Creating table users")
            return query("CREATE TABLE users(" + DB_USER_TABLE_FIELDS + ")")
        } else
            return Q(null)
    })

    .then(query.bind(null, "SHOW TABLES LIKE 'items'"))

    .then(function (rows) {
        if (rows.length != 1) {
            console.log("Creating table items")
            return query("CREATE TABLE items(" + DB_ITEMS_TABLE_FIELDS + ")")
        } else
            return Q(null)
    })

    .then(function() {
        deferred.resolve()
    })

    .fail(function (error) {
        close()
        deferred.reject(error)
    })

    return deferred.promise
}


var close = function () {
    connection.end()
}


module.exports = {}
module.exports.init = init
module.exports.close = close
module.exports.query = query
module.exports.startTransaction = startTransaction
module.exports.commitTransaction = commitTransaction
module.exports.rollbackTransaction = rollbackTransaction
