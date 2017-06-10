const SERVER_ADDRESS = '192.168.1.114:8080'
const REPORTS_REQUEST_CHUNK = 1000
const POLL_REQUEST_TIMEOUT = 120000
const TOKEN = "token"

let idsIndex = 0

let listItem
let listDetails



function Login() {
    $.ajax('http://192.168.1.114:8080/login', {
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({user:user.value,
                             password:pass.value}),
        dataType: "json",
        success: (data, status, jqXHR) => {
            if(jqXHR.status === 200) {
              localStorage.user= user.value
              localStorage.token=data.token
              window.location.href = "http://192.168.1.114:8080/Home/Bookshelf.html"
              //  resolve(data)
            }
            else{}
              //  reject(data)
        },
        error: (jqXHR, status, error) => {
            console.error("error")
            //reject(null)
        }
    })
}
//when the web page is fully loaded (ready)...

$(document).ready(function () {

    $("#btn-submit").click(Login);
    $("[name='my-checkbox']").bootstrapSwitch();

    $(".button").click((event) => {
        document.activeElement.blur()
    })

});
