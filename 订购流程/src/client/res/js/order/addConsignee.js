function AddConsigneePage(){
    var self=this;
        self.isDefault=ko.observable();
        self.region=ko.observable();
        self.regionId=ko.observable();
        self.mobile=ko.observable();
        self.userName=ko.observable();
        self.address=ko.observable();
        self.postalCode=ko.observable();
        self.setCallback=null;

    /*选择地区相关方法*/
    self.selectOptions=ko.observableArray();
    self.curSelectedOption=ko.observable();
    self.selectedHistory=[];
    self.back=function(){
        history.go(-1);
    };
    self.option=function(param){
        this.id=ko.observable(param.id);
        this.name=ko.observable(param.name);
        this.selected=ko.observable(false);
        this.parentId=ko.observable(param.parentId);
        this.hasChildren=ko.observable(param.hasChildren);
    }
    self.regionSelectView=ko.observable(false);

    self.showRegionSelectView=function(){
        self.selectedHistory=[];
        self.regionSelectView(true);
        var rootColumn = AppConfig.topRegionId || "c_region_1602";
        self.selectColumnLoad(rootColumn);
    };
    self.closeRegionSelectView=function(isFinish){
        /*判断是中途关闭还是已经选择完成*/
        if(isFinish==true){
            var region="";
            var historyLength=self.selectedHistory.length;
            for(var i=0;i<historyLength;i++){
                region=region+self.selectedHistory[i].name();
            }
            self.region(region);
            self.regionId(self.selectedHistory[historyLength-1].id());
        }
        self.regionSelectView(false);

    };
    self.selectRegion=function(item){
        if(self.curSelectedOption()){
            self.curSelectedOption().selected(false);
        }
        item.selected(true);
        self.curSelectedOption(item);
    }
    self.nextRegion=function(){
        if(self.curSelectedOption()){
            self.selectedHistory.push(self.curSelectedOption());
            if(self.curSelectedOption().hasChildren()=="false"){
                self.closeRegionSelectView(true);
            }
            self.selectColumnLoad(self.curSelectedOption().id());
            self.curSelectedOption("");
        }else{
            alert("请先选择地区信息");
        }

    };
    self.prevRegion=function(){
        var historyLength=self.selectedHistory.length;
        if(historyLength!=0){
            var index=historyLength-1;
            self.selectColumnLoad(self.selectedHistory[index].parentId());
            self.selectedHistory.pop();
        }else{
            alert("已经是最顶级，请选择地区点击下一步");
        }


    }
    /*根据regionId获取地区信息*/
    self.getNodeColumnLoad=function(item){
        $.ajax(AppConfig.url+"/tools/getNodeColumnLoad.jsp",{
            data : {
                topColumnId :AppConfig.topRegionId  || 'c_region_1602',
                fromId:item.regionId()
            },
            dataType:'json',
            type:'post',
            success:function(result){

            }
        });
    };
    /*根据regionId获取子元素*/
    self.selectColumnLoad=function(fromId){
        self.selectOptions.removeAll();
        $.ajax(AppConfig.url+"/tools/selectColumnLoad.jsp",{
            data : {
                id:fromId
            },
            dataType:'json',
            type:'post',
            success:function(result){
                for(var i=0;i<result.records.length;i++){
                    var param={};
                    param.id=result.records[i].id;
                    param.name=result.records[i].name;
                    param.parentId=result.records[i].parentId;
                    param.hasChildren=result.records[i].hasChildren;
                    var option=new self.option(param);
                    self.selectOptions.push(option);
                }
            }
        });
    };
    self.setDefalutAddress=function(){
        if(self.isDefault()){
            self.isDefault(false);
        }else{
            self.isDefault(true);
        }
    }
    self.saveData=function(){
        var reqParam={};
        reqParam.userName=self.userName();
        reqParam.mobile=self.mobile();
        reqParam.address=self.address();
        reqParam.isDefault=self.isDefault();
        reqParam.Zip=self.postalCode();
        reqParam.RegionId=self.regionId();
        $.post(AppConfig.url+'/templates/public/member/handle/address_add_handler.jsp',reqParam,function(result){
            if(result=="add-ok"||result=="edit-ok"){
                alert("添加成功！");
                if(self.callback&&typeof selfcallback=="function"){
                    self.callback(self);
                }else{
                    history.go(-1);
                }
            }else{
                alert("添加出错！")
            }

        },"html")
    };
    self.setCallback = function(callback){
        self.callback = callback;

    }
}
var addConsigneePage = null;
$(document).ready(function(){
    addConsigneePage = new AddConsigneePage();
    ko.applyBindings(addConsigneePage,document.getElementById("addConsigneePage"));
});