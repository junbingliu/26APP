var ids = [];
var toState = null;
$(document).ready(function () {
    let headIco = "";
    let initconfig = {
        bsV: "3",
        ajaxUrl: "load_activity.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    let merchantId = $("#merchantId").val();
    let pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId});
    let $body = $("body");
    $("#search").bind("click", function () {
        let keyword = $.trim($("#keyword").val());
        let searchArgs = {};
        if (keyword !== "") {
            searchArgs.keyword = keyword;
        }
        pagination.load(searchArgs);
    });
    $("#inputfile").bind("change", function () {
        if (!this.files || !this.files[0]) {
            return;
        }
        let awardImg = this.files[0];
        let reader = new FileReader();
        if (awardImg) {
            reader.readAsDataURL(awardImg);
        }
        reader.onload = function (event) {
            let imgData = event.target.result;
            $.post("../../handler/uploadFile.jsx", {type: 'json', imgData: JSON.stringify(imgData)}, function (ret) {
                let imgObj = $("#activityHeadIco");
                imgObj.attr("src", ret.ImgUrl);
                headIco = ret.ImgUrl;
            }, 'json');
        }
    });

    $("#submitActivity").bind("click", function () {
        let beginJoinTime = $("#beginJoinTime").val();
        let endJoinTime = $("#endJoinTime").val();
        // var club = $("#commonSelect").val();
        let club = {name: "越秀公园", id: "club_22222"};
        let title = $("#activityTitle").val();
        let singleEnd = $("#singleEnd").val();
        let multiEnd = $("#multiEnd").val();
        let htmlSouce = $("#prizeInstructions").val();
        let only = $('input[name="optionsRadiosinline"]:checked').val();

        let data = {
            beginJoinTime,
            endJoinTime,
            club,
            title,
            headIco,
            singleEnd,
            multiEnd,
            htmlSouce,
            only
        };
        console.log("========data========", data);
        if (!isNull(data)) {
            alert("请填写完所有信息");
            return;
        }
        $.post("../../handler/addActivityHandler.jsx", {data: JSON.stringify(data)}, function (ret) {

        });
    })
    $body.on('click', "#delBtnClick", function () {
        ids = [];
        let $this = $(this);
        ids.push($this.attr("data-a"));
        $('#deleteModelPanle').modal('show');
    });
    $body.on('click', "#confirmDelete", function () {
        if (!ids || ids.length < 1) {
            alert("您为选择任何活动");
            return;
        }
        $.post("../../handler/deleteActivity.jsx", {ids: JSON.stringify(ids)}, function (ret) {
            $('#deleteModelPanle').modal('hide');
            pagination.load({m: merchantId});
        }, 'json')


    });
    $body.on('click', "#confirmBatchDel", function () {
        $("input[name='activitySel']:checked").each(function () {
            ids.push($(this).val())

        });
        if (!ids || ids.length < 1) {
            alert("您为选择任何活动");
            return;
        }
        $.post("../../handler/deleteActivity.jsx", {ids: JSON.stringify(ids)}, function (ret) {
            $('#batchDelModelPanle').modal('hide');
            pagination.load({m: merchantId});
        }, 'json')


    });
    $("#rootDelBtn").click(function () {
        ids = [];
        $("#batchDelModelPanle").modal("show");
    });

});

function isNull(data) {
    for (let i in data) {
        if (!data[i] || data[i] === "") {
            return false;
        }
    }
    return true;
}

function auditFuc(val) {
    toState = val;
    ids = [];
    $("input[name='activitySel']:checked").each(function () {
        ids.push($(this).val());
    });
    if (!ids || ids.length < 1) {
        alert("您为选择任何活动");
        return;
    }
    $("#auditModelPanle").modal("show");
}

function confirmAudit() {
    $.post("../../handler/batchAudit.jsx", {ids: JSON.stringify(ids), toState: toState});
    $("#auditModelPanle").modal("hide");
}


