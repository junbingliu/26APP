//#import Util.js
//#import login.js
//#import user.js
//#import DateUtil.js
//#import sysArgument.js

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        var selfApi = new JavaImporter(
            Packages.org.json,
            Packages.net.xinshi.isone.modules,
            Packages.net.xinshi.isone.commons,
            Packages.java.util,
            Packages.java.lang,
            Packages.java.net,
            Packages.java.util.regex,
            Packages.net.xinshi.isone.functions.order,
            Packages.net.xinshi.isone.modules.order.bean,
            Packages.net.xinshi.isone.modules.order,
            Packages.net.xinshi.isone.modules.order.afterservice,
            Packages.net.xinshi.isone.modules.order.OrderSearchUtil,
            Packages.net.xinshi.isone.functions.product
        );

        try{
            var requestURI = request.getRequestURI() + "";
            var userId = "";
            var user = LoginService.getFrontendUser();
            if(user){
                userId = user.id;
            }else{
                response.sendRedirect("/login.html?rurl="+ encodeURI(requestURI));
            }

            var mid = "head_merchant";
            var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");
            var isApplyForReplacement = SysArgumentService.getSysArgumentStringValue(mid,'c_argument_platformKey','isApplyForReplacement');

            var page = $.params.page || "1";
            var keyWord = "";
            var startDay = "30";
            var jSearchArgs = new selfApi.JSONObject();
            jSearchArgs.put("buyerUserId", userId);
            jSearchArgs.put("page", page);
            jSearchArgs.put("limit", 15);
            if (startDay != "-1") {
                var curTime = DateUtil.getNowTime();;
                var beginTime = curTime - (parseInt(startDay) * 1000 * 60 * 60 * 24);
                jSearchArgs.put("beginCreateTime", beginTime + "");
            }

            var jSearchResult = selfApi.AfterOrderSearchUtil.getRefundOrders(jSearchArgs);
            var recordList = JSON.parse(jSearchResult.optJSONArray("recordList").toString());

            setPageDataProperty(pageData,"startDay", startDay);
            setPageDataProperty(pageData,"recordList", recordList);
            setPageDataProperty(pageData,"totalCount", jSearchResult.optInt("totalCount"));
            setPageDataProperty(pageData,"pageCount", jSearchResult.optInt("pageCount"));
            setPageDataProperty(pageData,"curPage", page);



            setPageDataProperty(pageData, "requestURI", requestURI + "");
            setPageDataProperty(pageData, "webName", webName);
            setPageDataProperty(pageData, "user", user);
            setPageDataProperty(pageData, "isApplyForReplacement", isApplyForReplacement);



        }catch (e){
            $.log(e);
        }




    });
})(dataProcessor);