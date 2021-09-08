$(document).ready(function () {
    $("#preloader").css({ display: "block" });
    $("body").css({ overflow: "visible" });
    $("#preloader").delay(1500).fadeOut("slow");
    $("body").delay(1500).css({ overflow: "visible" });
});
