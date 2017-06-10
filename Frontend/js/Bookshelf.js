
function goisbn() {
  console.log(isbncode.value);
    $.ajax('http://192.168.1.114:8080/book/isbn', {
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({token:localStorage.token,
                              user:localStorage.user,
                              isbn:isbncode.value}),
        dataType: "json",
        success: (data, status, jqXHR) => {
            if(jqXHR.status === 200) {

              window.location.href = "http://192.168.1.114:8080/Home/Bookshelf.html"
              //  resolve(data)
            }
            else{}
              //  reject(data)
        },
        error: (jqXHR, status, error) => {
          console.log("error")
            //reject(null)
        }
    })
}

//when the web page is fully loaded (ready)...
$(document).ready(function () {

    $("#submit-isbn").click(goisbn)

    $("[name='my-checkbox1']").bootstrapSwitch()

    $(".button").click((event) => {
        document.activeElement.blur()
    })


});
