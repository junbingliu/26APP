//#import Util.js
//#import login.js
//#import $yunruanInterface:services/YunruanArgService.jsx
//#import $yunruanInterface:services/YunruanService.jsx

;
(function () {
    var jArgs = YunruanArgService.getArgs();

    var openId = "o1yl_jqeq2Pwjd3q1mxlWyQNv_HY";
    var s = YunruanService.getMemberByOpenId(jArgs, openId);
    out.print(s);
})();
