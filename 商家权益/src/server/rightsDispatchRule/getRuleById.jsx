//#import Util.js
//#import merchantRights.js

var id = $.params.id;
if(id){
    var rule = MerchantRightsService.getDispatchRuleById(id);
    if(rule){
        var result = {
            state:"ok",
            rule:rule
        }
        out.print(JSON.stringify(result));
    }
    else{
        var result = {
            state:"err",
            msg:"no such rule."
        }
        out.print(JSON.stringify(result));
    }
}
else{
    var result = {
        state:"err",
        msg:"no rule"
    }
    out.print(JSON.stringify(result));
}



