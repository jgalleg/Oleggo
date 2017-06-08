var Client = require('node-rest-client').Client;

/*var options_auth = { user: "admin", password: "123" };
var clientS = new Client(options_auth);*/
var options = {
    // proxy configuration
    proxy: {
		host:"192.168.2.6",
        port: 8080}, // proxy port
    requestConfig: {
		timeout: 30000 //request timeout in milliseconds
	},
    responseConfig: {
		timeout: 30000 //response timeout
	}
}
var headers= { "Content-Type": "application/json" }
var login_data= { user: "jgalleg", password: "cabron" }
var args_login ={}

var ClientS = new Client(options);
token=null

module.exports={}
module.exports.get_token=function(success,error) {
	args_login.data=login_data
	args_login.headers=headers
    ClientS.post("http://192.168.2.6/login", args_login, function (data,response) {
		 console.log('Token response:' + response.statusCode)
		 //console.log(data.token)
    	if(response.statusCode===200){
			token=data.token
			success()
		}
        else error()
    }).on('error', function (err) {
        console.log('something went wrong on token!!' + err.code + err.message)

    })
}

module.exports.update=function(data_epc,success,token_error) {
	var message ={}
	message.data={}
    message.data.token= token
	message.data.fieldStatus = {}
	message.data.fieldStatus.groupId = 1
	message.data.fieldStatus.timestamp = Date.now()
	message.data.fieldStatus.items={}
    message.data.fieldStatus.items= Array.from(data_epc)
	message.headers=headers

    ClientS.post("http://192.168.2.6/report/fieldStatus", message, function (data,response) {
		 console.log('Update response:' +response.statusCode)
    	if(response.statusCode===200) success()
        else {
    		error_server(message,response,success,token_error)
        }
    }).on('error', function (err) {
        console.log('something wrong with server!!' + err.code + err.message)
        token_error()
    })
}

function error_server(message, response,success,token_error) {
  // handle errors here
  console.log('Trying to Post again')
  //args_login.data= { user: "julian", password: "cabron" }
  ClientS.post("http://192.168.2.6/login", args_login,function (data,response) {
       console.log('http Token server:' + response.statusCode)
       //console.log(data.token)
      if(response.statusCode===200){
          token=data.token
          message.data.token= token
          ClientS.post("http://192.168.2.6/report/fieldStatus", message, function (data,response) {
               console.log('http Update DB:' + response.statusCode)
              if(response.statusCode===200){success()}
              else {
                  console.log('Intent to update fail')
                    token_error()
                  }
          }).on('error', function (err) {
              console.log('something wrong with server!!' + err.code + err.message)
              token_error()
          })
      }
      else token_error()
  }).on('error', function (err) {
      console.log('something wrong with server!!' + err.code + err.message)
      token_error()
  })

}
