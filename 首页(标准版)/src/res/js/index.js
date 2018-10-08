$(document).ready(function () {
    var screenWidth = screen.availWidth;//分辨率宽
    if ( screenWidth <=1024) {//普屏
        $(document.body).addClass("w990");
    }
    function backToTop() {
        var  backToTopEle = $("#backtop").click(function () {
            $("html, body").animate({ scrollTop:0 }, 1000);
        });
        backToTopFun = function () {
            var st = $(document).scrollTop(), winh = $(window).height();
            (st > 0) ? backToTopEle.show() : backToTopEle.hide();
            //IE6下的定位
            if (!window.XMLHttpRequest) {
                backToTopEle.css("top", st + winh - 166);
            }
        };
        $(window).bind("scroll", backToTopFun);
    }
    backToTop();



});
function fade(i){
    $("#floorRank"+i+" li").each(function(){
        $(this).mouseover(function(){
            $("#floorRank"+i+" li").removeClass("cur");
            $(this).addClass("cur");
        })
    })
}

