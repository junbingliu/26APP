/**
 * Created by PC180 on 2015/12/8.
 */
function AboutFangXing(){
    var self=this;
    self.aboutFangXings=ko.observableArray([]);
    self.isEmpty=ko.observable(false);
    self.getAbouts=function(){
        self.aboutFangXings([]);
        $.post("server/getAboutFangXing.jsx",{start:0,end:20},function(data){
            if(data.state=="ok"){
                if(data.result&&data.result.length>0){

                    for(var x=0;x< data.result.length;x++){
                        var value=data.result[x];
                        if(!value.id&&!value.userId){
                            self.deleted(value);
                        }else{
                            self.aboutFangXings.push(value)
                        }
                    }
                    //self.getAbouts();

                }else{
                    self.isEmpty(true);
                }
            }else{
                bootbox.alert(data.msg);
            }
        },"json")
    };


    self.add = function(){
        bootbox.prompt("请输入名称：",function(input){
            if(input){
                $.post("server/addAboutFangXingPart.jsx",{name:input},function(ret){
                    if(ret.state=="ok"){
                        bootbox.alert("添加成功。");
                        self.getAbouts();
                    }
                    else{
                        bootbox.alert(ret.msg);
                        self.getAbouts();
                    }
                },"json");
            }
        });
    };
    self.deleted=function(cat){
        var id=cat.id;
        if(id){
            $.post("server/deleteAboutFangXingPart.jsx",{id:id},function(ret){
                if(ret.state=="ok"){
                    bootbox.alert("删除成功！");
                    self.getAbouts();
                }else{
                    bootbox.alert("ret.msg");
                    self.getAbouts();
                }
            })
        }
    }
    self.updated = function(cat){
        id = cat.id;
        name = cat.name;

        bootbox.prompt({
            title:"请输入新的位置名称:",
            value:name,
            callback:function(input){
                if(input != null && input != ""){
                    $.post("server/updataAboutFangXing.jsx",{id:id,name:input},function(ret){
                        if(ret.state=="ok"){
                            bootbox.alert("修改成功。");
                            self.getAbouts();
                        }else{
                            bootbox.alert(ret.msg);
                        }
                    },"json");
                }
            }
        });


    }
}
var aboutFangXing=null;
$(function(){
    aboutFangXing = new AboutFangXing();
    ko.applyBindings(aboutFangXing,document.getElementById("aboutFangXingPage"));
});