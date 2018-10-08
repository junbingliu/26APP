//#import Util.js
//#import merchantRights.js

var id = $.params.id;
if(id){
    var template = MerchantRightsService.getTemplateById(id);
    if(template){
        var result = {
            state:"ok",
            template:template
        }
        out.print(JSON.stringify(result));
    }
    else{
        var result = {
            state:"err",
            msg:"no such template."
        }
        out.print(JSON.stringify(result));
    }
}
else{
    var result = {
        state:"err",
        msg:"no templateId"
    }
    out.print(JSON.stringify(result));
}



