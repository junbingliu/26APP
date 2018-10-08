//#import Util.js
//#import merchantRights.js
var templateString = $.params.template;
var m = $.params.m;

var template = JSON.parse(templateString);
if(template.id){
    MerchantRightsService.saveTemplate(template);
    var result = {state:"ok",id:template.id};
}
else{
    var id = MerchantRightsService.addTemplate(template);
    var result = {state:"ok",id:id};
}
out.print(JSON.stringify(result));
