$(function(){
    //分页
    new $.IsonePagination("#pagination_params");
    //时间插件
    $('.form_date').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 1,
        forceParse: 0
    });
    $('#checkboxAll').click(function(){
        if ($("#checkboxAll").attr("checked")) {
            $(":checkbox").attr("checked", true);
        } else {
            $(":checkbox").attr("checked", false);
        }
    });
    $('#subcheck').click(function(){
        if (!$("#subcheck").checked) {
            $("#checkboxAll").attr("checked", false);
        }
        var chsub = $("input[type='checkbox'][id='subcheck']").length;
        var checkedsub = $("input[type='checkbox'][id='subcheck']:checked").length;
        if (checkedsub == chsub) {
            $("#checkboxAll").attr("checked", true);
        }
    });
    $('.allReSend').click(function(){
        var chk_value =[];
        $('input[name="subcheck"]:checked').each(function(){
            chk_value.push($(this).val());
        });
        if(chk_value.length==0){
          alert("你还没有选择任何内容！");
        }else{
         var   loading = layer.load('loading...');
            var num =chk_value.length;
            var _num=1;
            for(var i=0;i<chk_value.length;i++){
                $.post("cetify.jsx",{data:chk_value[i]},function(reg){
                    _num=_num+1;
                    if(_num>=num){
                        layer.close(loading);
                        alert("订单审核成功!");
                        window.location.href=window.location.href;
                    }
                });
            }
        }
    });
    $('.refund').click(function(){
        var $that = $(this);
        var id = $that.attr("tag");
      $.post("cetify.jsx",{data:id},function(reg){
          if(reg=="ok"){
              alert("订单审核成功!");
              window.location.href=window.location.href;
          }else if(reg=="0") {
              alert("订单审核失败!获取数据失败!");
          }else if(reg=="addr"){
              alert("订单审核失败!收货地址为浙江省!");
          } else {
              alert("订单审核失败!获取创建时间失败!");
          }
      });
    });


});