"use strict"

module.exports.userVars = {
    NAME_LENGTH_MAX : 50,
    USER_LENGTH_MAX : 20,
    CITY_LENGTH_MAX : 50
}

module.exports.reportVars = {
    reasons : {
        ""           : 0,
        ""           : 1,
        ""           : 2,
        ""           : 3,
        ""           : 4,
        ""           : 5,
        ""           : 6,
        ""           : 7,
        ""           : 8
    },

    states : {
        "good"      : 0,
        "compromised"  : 1,
        "Bought"  : 2
    },

    pointsTable : [0, 5, -5]
}

function HTTPError(code, message) {

    this.name = this.constructor.name
    this.message = message

    if(code)
        this.code = code
    else
        this.code = 500

    return this
}

module.exports.HTTPError = HTTPError
