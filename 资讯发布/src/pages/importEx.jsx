//#import doT.min.js
//#import Util.js
(function () {

    var merchantId = $.params["m"];
    var recordListLeft = [];

    recordListLeft.push({id: 'objId', value: '1', name: '编码所在列', description:''});
    recordListLeft.push({id: 'channel', value: '2', name: '渠道所在列', description:''});
    recordListLeft.push({id: 'publishState', value: '3', name: '上下架状态所在列', description:''});

    var pageData = {
        merchantId: merchantId,
        recordListLeft:recordListLeft
    };
    var template = $.getProgram(appMd5, "pages/importEx.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

