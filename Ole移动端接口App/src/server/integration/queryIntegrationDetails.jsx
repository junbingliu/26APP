//#import Util.js
//#import login.js
//#import user.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js
//#import statistics.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = {
        code: 'E1B130005',
        msg: ""
    };
    try {
        var jUser = LoginService.getFrontendUser();
        if (!jUser) {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
            return;
        }

        var memberid = jUser.memberid;//会员编号
        //var memberid = $.params.memberid;
        var begindate = $.params.begindate;//开始日期
        var enddate = $.params.enddate;//结束日期
        var pageindex = $.params.pageindex;//页码
        var pagesize = $.params.pagesize;//页数
        var querytype = $.params.querytype;//积分查询类型

        if(!memberid || memberid == null){
            ret.msg = "会员编码不能为空";
            ret.code = "E1B130006";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!pageindex || pageindex == null){
            ret.msg = "页码不能为空";
            ret.code = "E1B130009";
            out.print(JSON.stringify(ret));
            return;
        }
        if(pageindex == "0"){
            ret.msg = "页码必须大于0";
            ret.code = "E1B130013";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!pagesize || pagesize == null){
            ret.msg = "页数不能为空";
            ret.code = "E1B130010";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!begindate || begindate == null){
            ret.msg = "开始日期不能为空";
            ret.code = "E1B130009";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!enddate || enddate == null){
            ret.msg = "结束日期不能为空";
            ret.code = "E1B130010";
            out.print(JSON.stringify(ret));
            return;
        }
        var paramobj = {
            memberid:memberid,
            begindate:begindate,
            enddate:enddate,
            pageindex:pageindex,
            pagesize:pagesize,
            querytype:querytype
        }
        var memberobj = UserService.queryIntegrationDetails(paramobj);
        var status = memberobj.status;
        if(status == "0"){
            ret.code = "S0A00000";
            ret.msg = "查询会员积分信息成功";
            ret.data = memberobj.data;
            out.print(JSON.stringify(ret));
        }else{
            ret.code = "E1B130011";
            ret.msg = memberobj.msg;
            out.print(JSON.stringify(ret));
            return;
        }

    } catch (e) {
        $.log("error info="+e);
        ret.msg = "查询会员积分信息失败";
        ret.code = "E1B130012";
        out.print(JSON.stringify(ret));
    }

})();

