/**
 * Created by Administrator on 2015/7/20 0013.
 */

$(function () {
    var wWidth = $(window).width();
    var font = Math.round(wWidth / 16);

    if (wWidth >= 364 && wWidth <= 375) {
        font = 23;
    } else if (wWidth == 360 || wWidth == 361) {
        font = 23;
    } else if (wWidth > 640) {
        font = 40;
    }

    $("#html").css("fontSize", font);
});


