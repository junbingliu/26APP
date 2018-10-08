//#import Util.js
//#import merchantAccounts.js
//#import login.js
//#import doT.min.js
//#import merchant.js
(function(){
    var uid = LoginService.getBackEndLoginUserId();
    var merchants = null;
    $.log("uid=" + uid);
    if(uid=='u_0'){
        $.log("searching...");

        var result = MerchantService.search(0,50,null,"col_merchant_all",null,null,null,null,null,null,null,null);
        $.log("merchantCount=" + result.total + "\n");
        merchants = result.merchants;
    }
    else{
        merchants = MerchantAccountService.getMerchantsOfAdmin(uid);
    }
    $.log("merchants=" + JSON.stringify(merchants));

    var template = $.getProgram(appMd5,"home.jsxp");
    var pageData = {merchants:merchants};
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

