//#import Util.js
//#import product.js
//#import login.js
//#import user.js
//#import file.js
//#import DateUtil.js
//#import sysArgument.js
//#import column.js

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

        var grade = user.grade;
        if(grade){
            grade = parseInt(grade);
            if(user.checkedemailStatus == "1"){
                grade += 20;
            }
            if(user.checkedphoneStatus == "1"){
                grade += 20;
            }
        }

        setPageDataProperty(pageData, "requestURI", requestURI + "");
        setPageDataProperty(pageData, "webName", webName);
        setPageDataProperty(pageData, "user", user);
        setPageDataProperty(pageData, "userGrade", grade);


    });
})(dataProcessor);