
//when the web page is fully loaded (ready)...

$(document).ready(function () {

    $("#btn-black").click(BlackBg);
    $("[name='my-checkbox']").bootstrapSwitch();


    function BlackBg() {
        $("#text").css('background-color','#3D3C47');
        $.ajax('http://192.168.1.:8080/login', {
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({user:"jgalleg",
                                 password:"cabron"}),
            dataType: "json",
            success: (data, status, jqXHR) => {
                if(jqXHR.status === 200) {
                  //  resolve(data)
                }
                else{}
                  //  reject(data)
            },
            error: (jqXHR, status, error) => {
                //console.error(`/searchReports: ${status} - ${error}`)
                //reject(null)
            }
        })
    }

});
