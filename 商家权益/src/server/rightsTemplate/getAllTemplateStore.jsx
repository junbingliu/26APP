//#import merchantRights.js
var templates = MerchantRightsService.getAllTemplates();
var result = {
    state:"ok",
    templates:templates
};
out.print(JSON.stringify(result));