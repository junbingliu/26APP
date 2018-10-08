$(document).ready(function () {
    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = null;
    window.loadChart = function () {
        var api_id = $.trim($("#api_id").val());
        var api_name = $.trim($("#api_name").val());
        var beginCallTime = $.trim($("#beginCallTime").val());
        var endCallTime = $.trim($("#endCallTime").val());
        var groupBy = $.trim($("#groupBy").val());
        var searchArgs = {};
        if (api_id) {
            searchArgs.api_id = api_id;
        }
        if (api_name) {
            searchArgs.api_name = api_name;
        }
        if (beginCallTime) {
            searchArgs.beginCallTime = beginCallTime;
        }
        if (endCallTime) {
            searchArgs.endCallTime = endCallTime;
        }
        if (groupBy) {
            searchArgs.groupBy = groupBy;
        }
        function getColor() {
            return 'rgba(' + Math.ceil(Math.random() * 255) + ',' +
                Math.ceil(Math.random() * 255) + ',' + Math.ceil(Math.random() * 255) + ',0.2)';
        }

        $.post("handler/load_chart.jsx", searchArgs, function (ret) {
            if (ret.state == "ok") {
                var list = ret.data;
                if (list.length == 0) {
                    bootbox.alert("没有查到数据，请修改查询条件");
                    return;
                }

                var labels = [];
                var datas = [];
                var bgColor = [];
                for (var i = 0; i < list.length; i++) {
                    var a = list[i];
                    labels.push(a.apiName);
                    datas.push(a.count);
                    bgColor.push(getColor());//颜色随机生成
                }
                var data = {
                    labels: labels,
                    datasets: [{
                        label: "Api调用次数统计",
                        data: datas,
                        backgroundColor: bgColor,
                        borderWidth: 1
                    }]
                };
                if (!myChart) {
                    myChart = new Chart(ctx, {
                        type: 'pie',//line 线状，bar 柱状，radar 雷达 pie 饼状，doughnut 环状，polarArea 极地图，bubble 泡
                        data: data,
                        options: {}
                    });
                } else {
                    myChart.data = data;
                    myChart.update();
                }
            }
        }, "JSON");
    };
    window.loadChart();
    $("#search").on("click", function () {
        loadChart();
    });
    $("#api_id").on("keydown", function (event) {
        if (event.keyCode == '13') {
            loadChart();
        }
    });
    $("#api_name").on("keydown", function (event) {
        if (event.keyCode == '13') {
            loadChart();
        }
    });
});

function reloadList() {
    window.loadChart();
}