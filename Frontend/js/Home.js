const SERVER_ADDRESS = '192.168.1.114:8080'
const REPORTS_REQUEST_CHUNK = 1000
const POLL_REQUEST_TIMEOUT = 120000
const TOKEN = "token"

let idsIndex = 0

let listItem
let listDetails



function Login() {
    $.ajax('http://192.168.100.2:8080/login', {
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({user:user.value,
                             password:pass.value}),
        dataType: "json",
        success: (data, status, jqXHR) => {
            if(jqXHR.status === 200) {
              localStorage.user= user.value
              localStorage.token=data.token
              window.location.href = "http://192.168.100.2:8080/Home/Bookshelf.html"
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
    $(".navbar a, footer a[href='#HomeBody']").on('click', function(event) {
      // Make sure this.hash has a value before overriding default behavior
      if (this.hash !== "") {
        // Prevent default anchor click behavior
        event.preventDefault();

        // Store hash
        var hash = this.hash;

        // Using jQuery's animate() method to add smooth page scroll
        // The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
        $('html, body').animate({
          scrollTop: $(hash).offset().top
        }, 900, function(){

          // Add hash (#) to URL when done scrolling (default click behavior)
          window.location.hash = hash;
        });
      } // End if
    });
});
