$(document).ready(function () {
    $("#getProduct").on("click", function () {
        var cardNumber = $("input[name=cardno]").val();
        if (!cardNumber) {
            alert("请输入提货券编码");
            return false;
        }
        var password = $("input[name=password]").val();
        if (!password) {
            alert("请输入密码");
            return false;
        }
        var param = {
            cardNumber: cardNumber,
            password: password
        };
        $.post("/" + rappId + "/handler/get_del_vouchers_handler.jsx", param, function (ret) {
            if (ret) {
                if (ret.state == "ok") {
                    var products = ret.products;
                    if (!products || products.length == 0) {
                        alert("没有找到提货券编码是" + cardNumber + "对应的商品");
                        return;
                    }
                    add2cart(products, 0, add2cart);
                } else {
                    alert(ret.msg);
                }
            } else {
                alert("获取商品信息失败,请联系管理员！");
            }
        }, "JSON");
    });

    var add2cart = function (products, index, callback) {
        var product = products[index];
        index++;
        var params = {};
        params.objectId = product.productId;
        params.amount = 1;
        params.flowType = "normal_add2cart";
        params.skuId = product.skuId;
        $.post("/shopping/handle/v3/do_buy.jsp", params, function (ret) {
            if (ret.indexOf("ok") > -1) {
                if (callback && index < products.length) {
                    callback(products, index, add2cart);
                } else {
                    var value = confirm("请务必在\"使用优惠券\"项目勾选本次优惠活动\"赤湾码头员工专属福利\"");
                    if (value) {
                        window.location.href = "/orderForm.html";
                    }
                }
            } else {
                ret = JSON.parse(ret);
                if (!ret.state) {
                    if (ret.error_code == "product_not_exist") {
                        alert("该商品不存在!");
                    } else if (ret.error_code == "product_off_shelves") {
                        alert("该商品已下架!");
                    } else if (ret.error_code == "product_info_wrong") {
                        alert("商品销售信息有误!");
                    } else if (ret.error_code == "product_out_of_stock") {
                        alert("商品库存不足!");
                    } else if (ret.error_code == "error") {
                        alert(ret.msg);
                    } else {
                        alert("加入购物车失败,未知错误!" + ret.error_code);
                    }
                }
            }
        });
    };
});