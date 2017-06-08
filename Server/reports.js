"use strict"

const express = require('express')
const Q = require('q')
const C = require('./common.js')
const HTTPError = require('./common.js').HTTPError
const adapter = require("./reportAdapter.js")
const reportStates = require('./common.js').reportVars.states
const user = require('./user.js')

const router = express.Router()

router.post("/fieldStatus", (req, res) => {
        var status = req.body.fieldStatus

        if(!status                  ||
           isNaN(status.groupId)    ||
           !status.items            ||
           isNaN(status.timestamp))
           throw new HTTPError(400, "Invalid fieldStatus")

        status.items.forEach((item, i) => {
            if(!item.epc || isNaN(item.state) || item.state < 0 || item.state > 2)
                throw new HTTPError(400, "Invalid item ${i}")
        })

        user.validateBodyToken(req,res,function(error){

            throw new HTTPError(error.code,error.message)
        })

        req.body.user=res.locals.user.user
        console.log("Fieldstare update from: " + res.locals.user.user)

        adapter.addItems(req.body)

        res.status(200).end()
})

//only for testing
router.post("/new", (req, res) => {
        var status = req.body.fieldStatus

        if(!status                  ||
           isNaN(status.groupId)    ||
           !status.items            ||
           isNaN(status.timestamp))
           throw new HTTPError(400, "Invalid fieldStatus")

        status.items.forEach((item, i) => {
            if(!item.epc || isNaN(item.state) || item.state < 0 || item.state > 2)
                throw new HTTPError(400, "Invalid item ${i}")
        })

        user.validateBodyToken(req,res,function(error){

            throw new HTTPError(error.code,error.message)
        })

        req.body.user=res.locals.user.user
        console.log("Fieldstare update from: " + res.locals.user.user)

        adapter.newItems(req.body)

        res.status(200).end()
})

/*
var saveReport = function(req, res, type, fileName) {
    var deferred = Q.defer()

    console.log("saving report")

    if(!res.locals.user)
        deferred.reject(new Error("Invalid user"))

    if(!req.body.place || !req.body.reason)
        deferred.reject(new HTTPError(400, "Missing fields"))

    if(req.body.reason >= reportReasons.length || req.body.reason < 0)
        deferred.reject((new HTTPError(400, "Invalid reason")))

    if(req.body.caption && req.body.caption.length >= CAPTION_LENGTH_MAX)
        deferred.reject((new HTTPError(400, "Caption is too long")))

    Q.fcall(function() {
        var report = { user : res.locals.user.id,
                       place : req.body.place,
                       reason : req.body.reason,
                       reason_other :
                            (req.body.reason == reportReasons["other"] ? req.body.reason_other : null),
                       caption : req.body.caption,
                       media : type,
                       file_name : fileName }

        return adapter.addReport(report)
    })

    .then(function(reportId) {
        if(!fileName) {
            console.log("new report notifying")
            require("./backoffice.js").notifyNewReport()
            deferred.resolve(reportId)
        }
        else {
            fs.rename(C.TEMP_FOLDER + "/" + fileName, REPORTS_FOLDER + "/" + fileName,
            function(error) {
                try {
                    if(error) {
                        adapter.removeReport(reportId)
                        .fail(function(error) {
                            console.log("Unable to remove report %d", reportId)
                        })

                        C.removeTempFile(fileName)

                        deferred.reject(new Error("Unable to copy file " + fileName +
                                                  " in reports folder - " + error.message))
                    }
                    else {
                        console.log("new report notifying")
                        require("./backoffice.js").notifyNewReport()
                        deferred.resolve(reportId)
                    }
                }
                catch(error) {
                    C.removeTempFile(fileName)
                    deferred.reject(error)
                }
            })
        }
    })

    .fail(function(error) {
        C.removeTempFile(fileName)
        deferred.reject(error)
    })

    return deferred.promise
}
*/


module.exports = {}
module.exports.router = router
