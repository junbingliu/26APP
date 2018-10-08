//#import Util.js
//#import login.js
//#import DigestUtil.js
//#import DateUtil.js
//#import @jsLib/GenToken.jsx

;(function(){
    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.commons,
        Packages.net.xinshi.isone.modules.user,
        Packages.java.util,
        Packages.java.net
    );

    var ret = {
        state:false,
        errorCode:""
    }
    try{
        var loggedUser = LoginService.getFrontendUser();
        var userId = "";
        if(loggedUser != null){
            userId = loggedUser.id
        }else{
            ret.errorCode = "not_logged";
            out.print(JSON.stringify(ret));
            return;
        }


        var paramToken = $.params.token;
        if(!paramToken){
            ret.errorCode = "token_empty";
            out.print(JSON.stringify(ret));
            return;
        }
        var token = GenToken.get("pwdChangeToken");
        if(!token) {
            ret.errorCode = "token_null";
            out.print(JSON.stringify(ret));
            return;
        }else if(paramToken != token){
            ret.errorCode = "token_error";
            out.print(JSON.stringify(ret));
            return;
        }


        var oldPwd = $.params.oldPwd;
        var newPwd = $.params.newPwd;

        if(!(oldPwd && newPwd)){
            ret.errorCode = "param_error";
            out.print(JSON.stringify(ret));
            return;
        }

        var result = selfApi.LoginUtil.loginById(userId, oldPwd, selfApi.LoginUtil.TARGET_MEMBER);
        if (result != selfApi.IUserService.LOGIN_SUCCESSFUL) {
            ret.errorCode = "login_failed";
            out.print(JSON.stringify(ret));
            return;
        }


        var baseGrade = 20;
        //判断密码强度，判断安全分数
        if(true){
            //判断输入密码的类型
            function CharMode(iN){
                if (iN>=48 && iN <=57) //数字
                    return 1;
                if (iN>=65 && iN <=90) //大写
                    return 2;
                if (iN>=97 && iN <=122) //小写
                    return 4;
                else
                    return 8;
            }
            //bitTotal函数
            //计算密码模式
            function bitTotal(num){
                var modes=0;
                for (i=0;i<4;i++){
                    if (num & 1) modes++;
                    num>>>=1;
                }
                return modes;
            }
            //返回强度级别
            function checkStrong(sPW){
                if (sPW.length<6)
                    return 0; //密码太短，不检测级别
                var Modes=0;
                for (var i=0;i<sPW.length;i++){
                    //密码模式
                    Modes|=CharMode(sPW.charCodeAt(i));
                }
                return bitTotal(Modes);
            }

            var s_level = checkStrong(newPwd);
            switch(s_level) {
                case 0:
                case 1:
                    baseGrade = 20;
                    break;
                case 2:
                    baseGrade = 40;
                    break;
                default:
                    baseGrade = 60;
                    break;
            }

        }


        //var grade = loggedUser.grade;
        //var gradeRecord = loggedUser.gradeRecord;
        //var myGrade = 0;
        //if (grade) {
        //    myGrade = parseInt(grade);
        //}
        //if (!gradeRecord) {
        //    myGrade += 20;
        //}

        var ran = Math.random() + "";
        var passran = newPwd + ran;
        var passwordsha = DigestUtil.digestString(passran, "SHA");
        var currentTime = DateUtil.getNowTime();

        loggedUser["passwordhash"] = passwordsha;
        loggedUser["random"] = ran;
        loggedUser["grade"] = baseGrade + "";
        //loggedUser["gradeRecord"] = "1";
        loggedUser["lastModifiedTime"] = currentTime + "";

        selfApi.IsoneModulesEngine.memberService.updateUser($.toJavaJSONObject(loggedUser), userId);
        ret.state = true;
        ret.errorCode = "";
        out.print(JSON.stringify(ret));
    }catch(e){
        ret.state = false;
        ret.errorCode = "system_error";
        out.print(JSON.stringify(ret));
    }
})();