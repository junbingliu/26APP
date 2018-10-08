/**
 * Created with IntelliJ IDEA.
 * User: Zheng
 * Date: 13-12-12
 * Time: 下午6:21
 * To change this template use File | Settings | File Templates.
 */
var ruleFormPage = null;
var selectColumnDialog = null;

function SelectColumnDialog() {
    var self = this;
    self.title = ko.observable();
    self.itemPath = ko.observableArray();
    self.itemChildren = ko.observableArray();
    self.fromId = "";
    self.callback = null;
    self.open = function(itemId,fromId,title,callback){
        self.title(title);
        self.fromId = fromId;
        self.callback = callback;
        $.post("server/rightsDispatchRule/getItemInfo.jsx",{id:itemId,fromId:fromId,m:m},function(data){
            if(data.state=='ok'){
                self.itemPath($.map(data.itemPath,function(item){
                    return new ColumnItem(item);
                }));
                self.itemChildren($.map(data.itemChildren,function(item){
                    return new ColumnItem(item);
                }))
            }
        },"json");
        $("#selectColumnDialog").modal("show");
    }
    self.setCurrentItem = function(item){
        self.open(item.id,self.fromId,self.title(),self.callback);
    }
    self.isEmpty = ko.computed(function(){
        return self.itemChildren().length==0;
    });
    self.onOk = function(){
        var path="";
        var id = "";
        $.each(self.itemPath(),function(idx,item){
            path = path + ">"+item.name;
            id = item.id;
        });
        self.callback(path,id);
        $("#selectColumnDialog").modal("hide");
    }
}

function RuleFormViewModel() {
    var self = this;
    self.rule = new RightsDispatchRule({});
    self.setOrg = function(path,id){
        self.rule.orgName(path);
        self.rule.orgId(id);
    }
    self.setLevel = function(path,id){
        self.rule.levelId(id);
        self.rule.levelName(path);
    }
    self.setMainCategory = function(path,id){
        self.rule.mainCategoryId(id);
        self.rule.mainCategoryName(path);
    }
    self.setCustomCategory = function(path,id){
        self.rule.customCategoryId(id);
        self.rule.customCategoryName(path);
    }
    self.selectOrg = function(){
        selectColumnDialog.open("col_merchant_all","col_merchant_all","选择组织机构",self.setOrg);
    };
    self.selectLevel = function(){
        selectColumnDialog.open("col_merchant_merchantgrade","col_merchant_merchantgrade","选择商家等级",self.setLevel);
    }
    self.selectMainCategory = function(){
        selectColumnDialog.open("col_merchant_sort","col_merchant_sort","选择商家主分类",self.setMainCategory);
    }
    self.selectCustomCategory = function(){
        selectColumnDialog.open("col_merchant_othersort","col_merchant_othersort","选择商家自定义分类",self.setCustomCategory);
    }
    self.save = function(){
        self.rule.templateId(self.selectedTemplate());
        $.each(self.templates(),function(idx,template){
            if(template.id()==self.selectedTemplate()){
                self.rule.templateName(template.name());
            }
        });
        var ruleData = ko.mapping.toJS(self.rule);

        $.post("server/rightsDispatchRule/saveRule.jsx",{m:m,rule:JSON.stringify(ruleData)},function(data){
            if(data.state=='ok'){
                self.rule.id(data.id);
                bootbox.alert("保存成功。");
            }
            else{
                bootbox.alert("保存失败。");
            }
        },"json");
    }
    self.setRuleId = function(id){
        $.post("server/rightsDispatchRule/getRuleById.jsx",{m:m,id:id},function(data){
            if(data.state=="ok"){
                self.rule.setData(data.rule);
                self.selectedTemplate(self.rule.templateId());
            }
            else{
                bootbox.alert("出错了。" + data.msg);
            }
        },"json");

    }
    self.templates = ko.observableArray();
    self.getAllTemplates = function(){
        $.post("server/rightsTemplate/getAllTemplates.jsx",{m:m},function(data){
            if(data.state=='ok'){
                var templates = $.map(data.templates,function(template){
                    var templateObj = new RightsTemplate(template);
                    return templateObj;
                });
                self.templates(templates);
            }
        },"json");
    } ;
    self.selectedTemplate = ko.observable();
    self.selectedTemplate(self.rule.templateId());
    self.getAllTemplates();
}


function ColumnItem(item){
    var self = this;
    self.name = item.name;
    self.id = item.id;
}

$(document).ready(function () {
    ruleFormPage = new RuleFormViewModel();
    selectColumnDialog = new SelectColumnDialog();
    ko.applyBindings(selectColumnDialog, document.getElementById("selectColumnDialog"));
    ko.applyBindings(ruleFormPage, document.getElementById("rightsDispatchRuleForm"));
});