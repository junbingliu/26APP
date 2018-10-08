$(document).ready(function () {
    $("#submit_form1").on('click', "#doSendSkuQuantityToOMS", function () {
        //对接商家实际库存
        doSendSkuQuantityToOMS();
    });
    $("#submit_form1").on('click', "#doSendSkuQuantityToOMS_all", function () {
        //对接商家实际库存
        doSendSkuQuantityToOMSAll();
    });
    $("#submit_form1").on('click', "#doSendOneSkuQuantityToOMS", function () {
        //对接商品实际库存
        doSendOneSkuQuantityToOMS();
    });

    $("#submit_form2").on('click', "#doReSendProductToOMS", function () {
        //对接商品
        doReSendProductToOMS();
    });

    $("#submit_form3").on('click', "#doReSendColumnToOMS", function () {
        //对接栏目
        doReSendColumnToOMS();
    });

});

function doSendSkuQuantityToOMS() {
    var $doMerchantId = $("#doMerchantId");
    var postData = {
        doMerchantId: $doMerchantId.val()
    };

    if (!confirm("确定要对接商家实际库存到OMS吗？")) {
        return;
    }

    $.post("tools/doSendSkuQuantityToOMS.jsx", postData, function (data) {
        if (data.code == 'ok') {
            alert("操作成功");
        } else {
            alert(data.msg);
        }
    }, "json");
}
function doSendSkuQuantityToOMSAll() {
    var $doMerchantId = $("#doMerchantId");
    var postData = {
        doMerchantId: $doMerchantId.val(),
        isAll: "Y"
    };

    if (!confirm("确定要对接商家实际库存到OMS吗？")) {
        return;
    }

    $.post("tools/doSendSkuQuantityToOMS.jsx", postData, function (data) {
        if (data.code == 'ok') {
            alert("操作成功");
        } else {
            alert(data.msg);
        }
    }, "json");
}

function doSendOneSkuQuantityToOMS() {
    var $doMerchantId = $("#doMerchantId");
    var $skuNo = $("#skuNo");
    var postData = {
        doMerchantId: $doMerchantId.val(),
        skuNo: $skuNo.val()
    };

    if (!confirm("确定要实际库存到OMS吗？")) {
        return;
    }

    $.post("tools/doSendOneSkuQuantityToOMS.jsx", postData, function (data) {
        if (data.code == 'ok') {
            alert("操作成功");
        } else {
            alert(data.msg);
        }
    }, "json");
}

function doReSendProductToOMS() {
    var $productId = $("#productId");
    var pMerchantId = $("#pMerchantId");
    var $skuId = $("#skuId");
    var $actionType = $("input[name='actionType']:checked");
    var postData = {
        productId: $productId.val(),
        pMerchantId: pMerchantId.val(),
        skuId: $skuId.val(),
        actionType: $actionType.val()
    };

    if (!confirm("确定要对接商品到OMS吗？")) {
        return;
    }

    $.post("tools/doSendProductToOMS.jsx", postData, function (data) {
        if (data.code == 'ok') {
            alert("操作成功");
        } else {
            alert(data.msg);
        }
    }, "json");
}

function doReSendColumnToOMS() {
    var $productId = $("#columnId");
    var $actionType = $("#submit_form3 input[name='actionType']:checked");
    var postData = {
        columnId: $productId.val(),
        actionType: $actionType.val()
    };

    if (!confirm("确定要对接栏目到OMS吗？")) {
        return;
    }

    $.post("tools/doSendColumnToOMS.jsx", postData, function (data) {
        if (data.code == 'ok') {
            alert("操作成功");
        } else {
            alert(data.msg);
        }
    }, "json");
}



