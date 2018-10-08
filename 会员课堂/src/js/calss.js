var province = [];
var ischeck = true;
var selectShopList = [];
var selectRegion = [];
$(document).ready(function () {
    $.post("../../handler/getRegionChildren.jsx", {}, function (ret) {
        var select = $("#commonSelect");
        province = ret.data.children;
        for (var i = 0; i < province.length; i++) {
            var obj = "<option value=" + province[i].id + ">" + province[i].name + "</option>";
            select.append(obj)
        }
    }, 'json');
    $(".checkAll").bind("click", function () {
        var selList = $(".checkShop");
        for (var i = 0; i < selList.length; i++) {
            if (ischeck) {
                selList[i].checked = true;
            } else {
                selList[i].checked = false;

            }
        }
        if (ischeck) {
            ischeck = false;
        }
        else {
            ischeck = true;
        }
    });
    $(".shopInfo").bind("click",function () {
        alert("========1=======");
    });
    $("#isSingel").bind("click", function () {
        var classList = $(".commonBorderList");
        classList.empty();

    });
    $("#addMermberClass").bind("click", function () {
        var id = $("#AcId").val();
        var beginTime = $("#beginTime").val();
        var endTime = $("#endTime").val();
        var personNum = $(".personNum").val();
        var sill = $("#sill").val();
        var unifyPeice = {};
        var onlyintergal = $("#onlyintergal");
        var intergalAndPrice = $("#intergalAndPrice");
        var onlyPrice = $("#onlyPrice");
        // console.log("=========onlyintergal==========", onlyintergal);
        var onlyintergalNum = $("#onlyintergalNum").val();
        var andIntergal = $("#andIntergal").val();
        var andPrice = $("#andPrice").val();
        var onlyPriceNum = $("#onlyPriceNum").val();
        if (onlyintergal[0].checked) {
            unifyPeice.integral = {priceType: "integral", totalPrice: onlyintergalNum, priceName: "积分"};
        }
        if (intergalAndPrice[0].checked) {
            unifyPeice.moneyAndIntegral = {
                priceType: "moneyAndIntegral",
                totalMoney: andPrice,
                totalIntegral: andIntergal,
                priceName: "现金加积分"
            };
        }
        if (onlyPrice[0].checked) {
            unifyPeice.money = {priceType: "money", totalPrice: onlyPriceNum, priceName: "现金"};
        }

        var regionSet = new Set(selectRegion);
        var regionList = Array.from(regionSet);
        var data = {beginTime, endTime, personNum, sill, unifyPeice};
        data.activityId = id;
        data.shopRegion = regionList;
        data.shopList = selectShopList;

        console.log("======shopRegion========", data);

        $.post("../../handler/addClass.jsx", {data: JSON.stringify(data)}, function (ret) {

        }, 'json')
    })


});

