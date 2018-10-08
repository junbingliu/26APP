$(document).ready(function () {

    var dataFormDiv = $("#data_form");
    dataFormDiv.on('click', "#selectCategory", function () {
        productCategorySelector.openSelectView(function (selectedItems) {
            if (selectedItems.length == 0) {
                return;
            }
            var cat = selectedItems[0];
            var postData = {
                m: merchantId,
                catId: cat.id
            };

            $.post("ArgsForm_handler.jsx", postData, function (data) {
                if (data.code == 'ok') {
                    reLoadData();
                } else {
                    alert(data.msg);
                }
            }, "json");
        });
    });

    dataFormDiv.on('click', "#submit_form", function () {
        var isEnableRule = $('#data_form input[name="isEnableRule"]:checked').val();
        var postData = {
            m: merchantId,
            isEnableRule: isEnableRule
        };

        $.post("ArgsForm_handler.jsx", postData, function (data) {
            if (data.code == 'ok') {
                alert(data.msg);
            } else {
                alert(data.msg);
            }
        }, "json");
    });

    dataFormDiv.on('click', ".deleteCat", function () {
        var $this = $(this);
        var cid = $this.attr("data-a");
        var postData = {
            m: merchantId,
            catId: cid
        };

        $.post("deleteColumnId.jsx", postData, function (data) {
            if (data.code == 'ok') {
                reLoadData();
            } else {
                alert(data.msg);
            }
        }, "json");
    });

    reLoadData();
});


function reLoadData() {
    var postData = {};
    postData.m = merchantId;
    $.ajax({
            url: "load_columnIds.jsx",
            type: "post",
            data: postData,
            dataType: 'html',
            success: function (data) {
                var divShow = $("#recordList");
                divShow.html("");
                divShow.append(data);
            }
        }
    );
}



