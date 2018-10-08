//#import Util.js
//#import app.js

var merchant = $.params['m'];
if(!merchant){
    merchant = 'm_100';
}
var apps = AppService.getIndependentApps(merchant,0,-1);
apps = apps.map(function(app){
   return {id:app.id,name:app.name}
});
out.print(JSON.stringify(apps));
