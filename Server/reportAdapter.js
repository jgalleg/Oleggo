"use strict"

const Q = require('q')
const db = require('./db.js')


var addItems = function(data) {

        getItemsFromDB(data)
        .then(function(dbdata){
            inventory(dbdata,data)
        })
    console.log("Database Updated");
}

var getItemsFromDB = function(data){
    var deferred = Q.defer()
    var query
    query = "SELECT * from items WHERE epc in (?)"

    if(data.fieldStatus.items) {
        var epcs = data.fieldStatus.items.map((item) => {
            return item.epc
        })
    }
    else {
        deferred.reject(new Error("Invalid arguments"))
        return deferred.promise;
    }

    db.query(query, [epcs])

    .then(function(results) {

        if(results.length >= 1){
                var dbepcs = {}
                results.forEach((obj) => {
                    dbepcs[obj.epc] = obj
                })

                deferred.resolve(dbepcs)
            }
        else
            deferred.resolve(null)
    })

    .fail(function(error) {
       deferred.reject(error)
    })

    return deferred.promise
}

var inventory = function (dbdata,data){
    var dat= data.fieldStatus.items

    for(var i=0; i<dat.length; i++){
        if(!dbdata[dat[i].epc])//if doesn't exist don't do anything
            console.log("not in DB" + dat[i].epc)
        else{
            if(dbdata[dat[i].epc].state!=dat[i].state){
                var Item={}
                Item={groupitem:data.fieldStatus.groupId,
                          state_change_ts:Date.now(),
                          type:"1",
                          state:dat[i].state,
                          epc:dat[i].epc,
                          user:data.user
                         }
                console.log(Item)
                switch (dat[i].state) {
                    case '0':
                            //nothing
                            console.log("not possible to Update state: 0")
                    break;
                    case '1'://assign compromised
                            {console.log("state: 1")
                            updateItem(Item)}
                    break;
                    case '2'://assign bought
                            {console.log("state: 2")
                            updateItem(Item)}
                    break;
                    default:
                }
            }
        }
    }
}

var updateItem=function(ItemUpdate){
        var deferred = Q.defer
        var values = []
        ItemUpdate.state_change_ts=Date.now();
        values.push(ItemUpdate)

        var query = "UPDATE items SET ? "

        values.push(ItemUpdate.epc)
        query += "WHERE epc = ?"

        db.query(query, values)

        .then(function(results) {
            console.log("Item updated " + ItemUpdate.epc)
            deferred.resolve(results.affectedRows === 1)
        })

        .catch(function(error) {
            deferred.reject(error)
        })
    return deferred.promise
}


//only for testing
var newItems = function(data) {
    var length =data.fieldStatus.items.length
    var Item={}
    for(var i=0;i<length;i++){
        Item={groupitem:data.fieldStatus.groupId,
                  state_change_ts:data.fieldStatus.timestamp,
                  type:"1",
                  state:data.fieldStatus.items[i].state,
                  epc:data.fieldStatus.items[i].epc,
                  user:data.user
                 }
        addNewItem(Item)
    }
    console.log("Database Updated");
}

var addNewItem=function(data){
    var deferred = Q.defer()
    var query = "INSERT into items SET ?"
    data.registration_ts = Date.now();
    db.query(query, data)

    .then(function(results) {
        deferred.resolve(results.insertId)
        console.log("Item add at id: " + results.insertId)
    })

    .fail(function(error) {
      if(error.code ===  "ER_DUP_ENTRY"){
         deferred.resolve(getItem(data))
       }
      else
      deferred.reject(error)
    })

    return deferred.promise
}

module.exports = {}
module.exports.addItems = addItems
module.exports.newItems= newItems
