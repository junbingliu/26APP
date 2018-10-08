
$(function(){

    $("#returnOrderSearchForm").submit(function(){
        var keywordObj = $("input[name='returnOrderKeyword']",this);
        var keywordVal = keywordObj.val();
        var checkResult = true;
        var pattern = /[`~!#$%^&*()+<>?:"{},\/;'[\]]/im;
        for (var i = 0; i < keywordVal.length; i++) {
            var val = keywordVal[i];
            if(pattern.test(val)){
                checkResult = false;
                break;
            }
        }
        if(!checkResult){
            alert("关键字包含非法字符，请检测输入。");
            keywordVal.focus();
            return false;
        }
    });

});
