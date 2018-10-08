//#import Util.js
//#import pigeon.js

var OrderListQuery = (function (pigeon) {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];

            //关键字
            if (searches.keyword && searches.keyword != "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }
            //ID
            if (searches.id) {
                searchQuery.push({n: 'id', v: searches.id, type: 'term', op: "and"});
            }
            //订单外部号
            if (searches.aliasCode) {
                searchQuery.push({n: 'aliasCode', v: searches.aliasCode, type: 'term', op: "and"});
            }
            //订单类型
            if (searches.orderType) {
                searchQuery.push({n: 'orderType', v: searches.orderType, type: 'term', op: "and"});
            }
            searchQuery.push({n: 'orderType', v: "tryuse", type: 'term', op: "not"});
            //订单来源
            if (searches.orderSource) {
                searchQuery.push({n: 'orderSource', v: searches.orderSource, type: 'term', op: "and"});
            }
            //买方名称
            if (searches.purchaserName) {
                searchQuery.push({n: 'deliveryUserName_text', v: searches.purchaserName, type: 'term', op: "and"});
            }
            //下单人名称
            if (searches.createUserName) {
                searchQuery.push({n: 'createUserName_text', v: searches.createUserName, type: 'term', op: "and"});
            }
            //下单人的userId
            if (searches.buyerId) {
                searchQuery.push({n: 'buyerId', v: searches.buyerId, type: 'text', op: "and"});
            }
            //处理人名称
            if (searches.processName) {
                searchQuery.push({n: 'processName_text', v: searches.processName, type: 'term', op: "and"});
            }
            //商品名称
            if (searches.productName) {
                searchQuery.push({n: 'productName_text', v: searches.productName, type: 'term', op: "and"});
            }
            //支付方式
            if (searches.payInterfaceId) {
                searchQuery.push({
                    n: 'payInterfaceId_multiValued',
                    v: searches.payInterfaceId,
                    type: 'term',
                    op: "and"
                });
            }
            //是否自提订单
            if (searches.isDeliveryPoint) {
                searchQuery.push({n: 'isDeliveryPoint', v: searches.isDeliveryPoint, type: 'term', op: "and"});
            }

            //自提点编码
            if (searches.deliveryPointCode) {
                searchQuery.push({n: 'deliveryPointCode', v: searches.deliveryPointCode, type: 'term', op: "and"});
            }
            //自提点地区ID
            if (searches.deliveryRegionId) {
                searchQuery.push({n: 'deliveryRegionId', v: searches.deliveryRegionId, type: 'term', op: "and"});
            }
            //商品名称
            if (searches.deliveryRegion) {
                searchQuery.push({
                    n: 'deliveryRegionId_multiValued',
                    v: searches.deliveryRegion,
                    type: 'term',
                    op: "and"
                });
            }
            //是否缺货
            if (searches.hasShorted) {
                searchQuery.push({n: 'hasShorted', v: searches.hasShorted, type: 'term', op: "and"});
            }
            //购买人电话
            if (searches.purchaserPhone) {
                searchQuery.push({n: 'deliveryPhone', v: searches.purchaserPhone, type: 'term', op: "and"});
            }
            //是否转赠订单
            if (searches.isGift) {
                searchQuery.push({n: 'isGift', v: searches.isGift, type: 'term', op: "term"});
            }

            var fixNumber = function (num, len) {
                var fix;
                if (num.length < len) {
                    fix = (new Array(len - num.length + 1)).join("0")
                }
                return fix + num
            };

            //配送金额上限
            if (searches.deliveryPayMax) {
                var obj = {n: 'orderDeliveryPrice', type: 'range', op: "and"};
                obj.high = fixNumber(searches.orderPayMax, 11);
                obj.low = fixNumber(searches.orderPayMin || "0", 11);
                searchQuery.push(obj);
            }

            //订单金额上限
            if (searches.orderPayMax) {
                var obj = {n: 'orderTotalPrice', type: 'range', op: "and"};
                obj.high = fixNumber(searches.orderPayMax, 11);
                obj.low = fixNumber(searches.orderPayMin || "0", 11);
                searchQuery.push(obj);
            }


            if (searches.sellerIds) {
                var args = [];
                for (var i = 0; i < searches.sellerIds.length; i++) {
                    var merchantId = searches.sellerIds[i];
                    args.push({n: 'sellerId', v: merchantId, type: 'term', op: "or"});
                }
                searchQuery.push({type: 'list', op: "and", subQuery: args});
            }

            //订单所属商家的主分类
            if (searches.merchant_mainColumn) {
                searchQuery.push({n: 'mainColumn_multiValued', v: searches.merchant_mainColumn, type: 'term', op: "and"});
            }

            //订单所属商家的自定义分类
            if (searches.merchant_otherColumn) {
                searchQuery.push({n: 'otherColumn_multiValued', v: searches.merchant_otherColumn, type: 'term', op: "and"});
            }

            //订单状态
            if (searches.processState) {
                searchQuery.push({n: 'orderState_multiValued', v: searches.processState, type: 'term', op: "and"});
            }
            //支付状态
            if (searches.payState) {
                searchQuery.push({n: 'orderState_multiValued', v: searches.payState, type: 'term', op: "and"});
                if (searches.payState == "p200") {
                    searchQuery.push({
                        n: 'orderStateType2state_multiValued',
                        v: "processState_p111",
                        type: 'term',
                        op: 'not'
                    });
                }
            }
            //
            if (searches.deliveryWayId) {
                searchQuery.push({n: 'deliveryWayId', v: searches.deliveryWayId, type: 'term', op: "and"});
            }
            //
            if (searches.hasRejected) {
                searchQuery.push({n: 'hasRejected', v: searches.hasRejected, type: 'term', op: "and"});
            }
            //买家评论状态
            if (searches.buyerReviewState) {
                searchQuery.push({n: 'buyerReviewState', v: searches.buyerReviewState, type: 'term', op: "and"});
                if (searches.buyerReviewState == "br100") {
                    searchQuery.push({n: 'hasApplyAfterService', v: 'N', type: 'term', op: "and"});
                }
            }
            if (searches.sellerId) {
                searchQuery.push({n: 'sellerId', v: searches.sellerId, type: 'term', op: "and"});
            }

            //下单时间
            var beginCreateTime = false;
            var beginCreateTimeQueryItem = {n: 'createTime', type: 'range', op: "and"};
            if (searches.beginCreateTime && searches.beginCreateTime != "") {
                beginCreateTimeQueryItem.low = searches.beginCreateTime;
                beginCreateTime = true;
            }
            if (searches.endCreateTime && searches.endCreateTime != "") {
                beginCreateTimeQueryItem.high = searches.endCreateTime;
                beginCreateTime = true;
            }
            if (beginCreateTime) {
                searchQuery.push(beginCreateTimeQueryItem);
            }
            //支付时间
            var beginPaidTime = false;
            var beginPaidTimeQueryItem = {n: 'createTime', type: 'range', op: "and"};
            if (searches.beginPaidTime && searches.beginPaidTime != "") {
                beginPaidTimeQueryItem.low = searches.beginPaidTime;
                beginPaidTime = true;
            }
            if (searches.endPaidTime && searches.endPaidTime != "") {
                beginPaidTimeQueryItem.high = searches.endPaidTime;
                beginPaidTime = true;
            }
            if (beginPaidTime) {
                searchQuery.push(beginPaidTimeQueryItem);
            }
            //完成时间
            var beginFinishTime = false;
            var beginFinishTimeQueryItem = {n: 'finishTime', type: 'range', op: "and"};
            if (searches.beginFinishTime && searches.beginFinishTime != "") {
                beginFinishTimeQueryItem.low = searches.beginFinishTime;
                beginFinishTime = true;
            }
            if (searches.endFinishTime && searches.endFinishTime != "") {
                beginFinishTimeQueryItem.high = searches.endFinishTime;
                beginFinishTime = true;
            }
            if (beginFinishTime) {
                searchQuery.push(beginFinishTimeQueryItem);
            }

            //确认时间
            var beginConfirmTime = false;
            var beginConfirmTimeQueryItem = {n: 'confirmTime', type: 'range', op: "and"};
            if (searches.beginConfirmTime && searches.beginConfirmTime != "") {
                beginConfirmTimeQueryItem.low = searches.beginConfirmTime;
                beginConfirmTime = true;
            }
            if (searches.endConfirmTime && searches.endConfirmTime != "") {
                beginConfirmTimeQueryItem.high = searches.endConfirmTime;
                beginConfirmTime = true;
            }
            if (beginConfirmTime) {
                searchQuery.push(beginConfirmTimeQueryItem);
            }
            // $.log(".............................searchQuery:" + JSON.stringify(searchQuery));

            return searchQuery;
        }
    };
    return f;

})($S);