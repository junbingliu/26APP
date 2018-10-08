var OrderDistributeUtil = {
    //itemPrices放着每个订单行的价格，payRecs放着每个支付方式的价格
    distribute: function (itemPrices, payRecs) {
        var sumItemPrices = 0;
        var itemPayRecs = [];
        itemPrices.forEach(function (itemPrice) {
            sumItemPrices += itemPrice;
            itemPayRecs.push([]);
        });

        for (var i = 0; i < itemPrices.length - 1; i++) {
            var itemPrice = itemPrices[i];
            var left = itemPrice;
            for (var j = 0; j < payRecs.length - 1; j++) {
                var payRec = payRecs[j];
                itemPayRecs[i][j] = (payRec * itemPrice / sumItemPrices+0.00001).toFixed(2);
                left -= itemPayRecs[i][j];
            }
            //最后一个item用倒逼法
            itemPayRecs[i][payRecs.length - 1] = left.toFixed(2);
        }
        for (var j = 0; j < payRecs.length; j++) {
            var payRec = payRecs[j];
            var left = payRec;
            for (var i = 0; i < itemPrices.length - 1; i++) {
                left -= itemPayRecs[i][j]
            }
            itemPayRecs[itemPrices.length - 1][j] = left.toFixed(2);
        }
        return itemPayRecs;
    }
};