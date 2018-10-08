//#import Util.js
//#import @utils/orderDistributeUtil.jsx

var itemPrices = [1,100,1000];
var payRecs = [1100,1];

var result = OrderDistributeUtil.distribute(itemPrices,payRecs);

out.print(JSON.stringify(result));

