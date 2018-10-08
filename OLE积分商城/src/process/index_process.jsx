//#import Util.js
//#import login.js
//#import product.js
//#import file.js
//#import DateUtil.js
//#import price.js
//#import sysArgument.js

(function(processor){

    var requestURI = request.getRequestURI() + "";
    var productionMode = true;
    if(requestURI == "/appEditor/handlers/getTemplate.jsx"){
        productionMode = false;
    }


    function every(elem){
        if(elem&&(!elem.url || !elem.url.length || elem.url.length==0)){
            if(elem.columnId){
                elem.url = "/product_list.jsp?cid=" + elem.columnId;
            };
        };
        if(elem&&elem.children){
            elem.children.forEach(function(child){every(child);})
        };
    };

    // processor.on("all", function (pageData, dataIds, elems) {
    //     var userId = "";
    //     var userName = "";
    //     var user = LoginService.getFrontendUser();
    //
    //
    // });


    processor.on(":imgLinkList",function(pageData,dataIds,elems){
        for(var i=0;i<elems.length;i++){
            var now=new Date().getTime();
            var elem=elems[i];
            var dataId = dataIds[i];
            var newElem=[];
            for(var j=0;j<elem.length;j++){
                var startDate=elem[j].startDate;
                var endDate=elem[j].endDate;
                if(startDate&&endDate){
                    var startDatelong=new Date(startDate.replace(/-/g,"/")).getTime();
                    var endDatelong=new Date(endDate.replace(/-/g,"/")).getTime();
                    if(startDatelong<now&&endDatelong>now){
                        newElem.unshift(elem[j]);
                    }else{
                        newElem.push(elem[j]);
                    }
                }else{
                    newElem.push(elem[j]);
                }
                setPageDataProperty(pageData,dataId,newElem);
            }
        }
    });




})(dataProcessor);
