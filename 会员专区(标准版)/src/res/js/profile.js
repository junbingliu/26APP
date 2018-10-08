


function handleBirthday(){
    var selectYear = $("#bth_year"),selectMonth = $("#bth_month"),selectDay = $("#bth_day");
    //先给年下拉框赋内容
    var curDate = new Date(),MonHead = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var curYear = curDate.getFullYear(),curMonth = curDate.getMonth() + 1,curDay = curDate.getDate();

    //以今年为准，前30年，后30年
    for (var i = (curYear - 80); i < (curYear + 2); i++) {
        selectYear.append("<option value='" + i + "'> " + i + " 年" + "</option>");
    }

    //赋月份的下拉框
    for (var i = 1; i < 13; i++) {
        selectMonth.append("<option value='" + i + "'> " + i + " 月" + "</option>");
    }

    selectYear.val(selectYear.attr("val") ? selectYear.attr("val") : "");
    selectMonth.val(selectMonth.attr("val") ? selectMonth.attr("val") : "");
    var n = MonHead[curDate.getMonth()];
    if (curDate.getMonth() == 1 && IsPinYear(curYear)) n++;
    writeDay(n); //赋日期下拉框
    selectDay.val(selectDay.attr("val") ? selectDay.attr("val") : "");

    selectYear.on("change",function(){
        //年发生变化时日期发生变化(主要是判断闰平年)
        var MMvalue = selectMonth.val(),curVal = $(this).val();
        if (curVal == "") {
            selectMonth.val("");
            selectDay.html("<option value=''>选择日</option>");
            return;
        }
        if (MMvalue == "") {
            selectDay.html("<option value=''>选择日</option>");
            return;
        }
        var n = MonHead[MMvalue - 1];
        if (MMvalue == 2 && IsPinYear(curVal)) n++;
        writeDay(n)
    });

    selectMonth.on("change",function(){
        //月发生变化时日期联动
        var YYYYvalue = selectYear.val(),curVal = $(this).val();

        if (curVal == "") {
            selectDay.html("<option value=''>选择日</option>");
            return;
        }
        var n = MonHead[curVal - 1];
        if (curVal == 2 && IsPinYear(YYYYvalue)) n++;
        writeDay(n)
    });

    function writeDay(n) {
        //据条件写日期的下拉框
        var s = "";
        for (var i = 1; i < (n + 1); i++) {
            s += "<option value='" + i + "'> " + i + " 日" + "</option>\r\n";
        }
        selectDay.html(s);
    }
    function IsPinYear(year) {
        //判断是否闰平年
        return (0 == year % 4 && (year % 100 != 0 || year % 400 == 0))
    }
}

$(function(){
    handleBirthday();
    $("#submitBtn").on("click",function(){
        $("#updateForm").ajaxSubmit({
            dataType:"json",
            beforeSubmit:function(){

            },
            success:function(responseText, statusText){
                if(responseText.state){
                    alert("保存成功");
                }else{
                    alert(responseText.errorCode);
                }
            }
        });
    });


    jQuery("#uploadify").uploadify({
        'script':'/'+rappId+'/handler/logo_update_handler.jsx?u='+loginId+'&d=' + new Date(),
        'uploader':'/js/jquery.uploadify-v2.1.0/uploadifyWEB.swf',
        'cancelImg':'/js/jquery.uploadify-v2.1.0/cancel.png',
        'folder':'uploads',
        'queueID':'fileQueue',
        'auto':true,
        'multi':false,
        'fileDesc':'只能上传JPG,GIF,PNG,JPEG格式',
        'fileExt':'*.jpg;*.gif;*.png;*.jpeg',
        'sizeLimit':1 * 1024 * 1024,
        onInit:function () {
            $("#save").hide();
        },
        onSelect:function () {
            $("#save").show();
            $("#fixchange").height(95);
        },
        onCancel:function () {
            $("#save").hide();
            $("#fixchange").height(28);
        },
        onAllComplete:function () {
            $.ajax({url:'/'+rappId+'/handler/logo_reload_handler.jsx?u='+loginId+'&d=' + new Date(), type:'GET', success:function (text) {
                $("#input").val(text.replace(/\s+/g, ""));
                $("#logoImg").attr("src", $.trim(text));
            }});
            $("#fixchange").height(28);
        }
    });



})
