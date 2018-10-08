//#import Util.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import @jsLib/GenToken.jsx

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        var requestURI = request.getRequestURI() + "";


        var userId = "";
        var user = LoginService.getFrontendUser();
        if(user){
            userId = user.id;
        }else{
            response.sendRedirect("/login.html?rurl="+requestURI);
        }

        var mid = "head_merchant";
        var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");

        var percent = 20;
        if(user.email){
            percent += 20;
        }
        if(user.mobilPhone){
            percent += 20;
        }
        if(user.realName){
            percent += 10;
        }
        if(user.gender){
            percent += 10;
        }
        if(user.birthday){
            percent += 10;
        }
        if(user.logo){
            percent += 10;
        }

        var bth_year = "";
        var bth_month = "";
        var bth_day = "";
        var birthdayTime = user.birthday;
        if(birthdayTime){
            var birthdayObj = new Date(parseInt(birthdayTime));
            bth_year = birthdayObj.getFullYear(),bth_month = birthdayObj.getMonth() + 1,bth_day = birthdayObj.getDate();
        }


        var token = GenToken.get("profileToken");
        setPageDataProperty(pageData, "token", token);

        setPageDataProperty(pageData, "webName", webName);
        setPageDataProperty(pageData, "percent", percent + "");
        setPageDataProperty(pageData, "user", user);
        setPageDataProperty(pageData, "bth_year", bth_year);
        setPageDataProperty(pageData, "bth_month", bth_month);
        setPageDataProperty(pageData, "bth_day", bth_day);

    });
})(dataProcessor);