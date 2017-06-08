//when the web page is fully loaded (ready)...
$(document).ready(function () {

    $("[name='my-checkbox1']").bootstrapSwitch();
  //  $("#btn_home").click(Go_back);
    $("#search").click(myFunction);

    function myFunction() {
      document.getElementById("demo").innerHTML = = $("#userFilter").val();
    }


});
