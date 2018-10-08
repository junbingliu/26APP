/**
 * Created with IntelliJ IDEA.
 * User: Zheng
 * Date: 13-12-12
 * Time: 下午6:21
 * To change this template use File | Settings | File Templates.
 */

function RuleListViewModel(){
    var self = this;
    self.rules = ko.observableArray();
    self.getRules = function(){
        $.post("server/rightsDispatchRule/getRules.jsx",{m:m},function(data){
            if(data.state=='ok'){
                var rules = $.map(data.rules,function(rule){
                    return new RightsDispatchRule(rule);
                }) ;
                self.rules(rules);
            }
            else{
                bootbox.alert("出错了！"+data.msg);
            }
        },"json");
    }
    this.deleteRule = function(rule){
        bootbox.confirm("确定删除？",function(result){
            if(result){
                $.post("server/rightsDispatchRule/deleteRule.jsx",{m:m,id:rule.id()},function(data){
                    if(data.state=='ok'){
                        bootbox.alert("删除成功。");
                        self.getRules();
                    }
                    else{
                        bootbox.alert("删除失败！");
                    }
                },"json");
            }
        });
    };
};

var ruleListPage = null;
$(document).ready(function(){
    ruleListPage = new RuleListViewModel();
    ko.applyBindings(ruleListPage,document.getElementById("ruleListPage"));
});