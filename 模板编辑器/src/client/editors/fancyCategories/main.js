//#import editorPage.js
(function FancyCategories(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var fancyCategoryEditor = window["fancyCategoryEditor"];
    if(fancyCategoryEditor){
        self.editorViewModel = fancyCategoryEditor;
    }
    else{
        self.editorViewModel = new FancyCategoryEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("fancyCategoriesEditor"));
        ko.applyBindings(self.editorViewModel,document.getElementById("fancyCategoriesEditor"));
        window["fancyCategoryEditor"] = self.editorViewModel;
    }


    self.clicking = false;
    $(".item .sortLayer", e).hide();
    console.log("FancyCategory init...");
    $("[data-type='fcat']", e).each(function (index,domEle) {
        var mode=$(domEle).attr("data-mode");

        if(mode!='simple'){
            var signElem =  $("#fancyCategories_sign > div").clone();

            var mask = $("#mask", e).clone();
            signElem.appendTo($(domEle)).mouseenter(function (){
                var height = $(domEle).height();
                var width =  $(domEle).width();
                mask.css({left: 0, top: 0, width: width, height: height}).appendTo($(domEle));
                mask.show();
                mask.off("click");
            }).mouseleave(function(){
                mask.remove();
            }).click(function(){
                self.clicking = true;
                mask.hide();
                var dataId = $(domEle).attr("dataId")||$(domEle).attr("data-id");
                self.editorViewModel.setDataId(dataId);
                var subType = $(domEle).attr("dataSubType");
                self.editorViewModel.sunType = subType;
                configs.appEditor.setCurrentPage("fancyCategoriesEditor");
            });
        }
        else{
            $(domEle).mouseenter(function(){
                var height = $(domEle).height();
                var width =  $(domEle).width();
                var offset = $(domEle).offset();
                var mask = $("#mask", e);
                mask.css({left: offset.left, top: offset.top, width: width, height: height}).appendTo($(domEle));
                mask.show();
                mask.off("click");
                mask.click(function(){
                    self.clicking = true;
                    mask.hide();
                    var dataId = $(domEle).attr("dataId")||$(domEle).attr("data-id");
                    self.editorViewModel.setDataId(dataId);
                    var subType = $(domEle).attr("dataSubType");
                    self.editorViewModel.sunType = subType;
                    configs.appEditor.setCurrentPage("fancyCategoriesEditor");
                });
            }).mouseleave(function(){
                $("#mask", e).hide();
            });

        }

    });
    /*fancy category begin*/
    $(".item > .sortLayer",e).hide();
    $(".item",e).mouseenter(function(){
        $(".sortLayer",this).fadeIn(300);
        $(this).addClass("itemCur");
    }).mouseleave(function(e){
            if(e.relatedTarget.id=="mask"){
                return;
            }
            $(".sortLayer",this).hide();
    });
      //万家菜单弹出

    function sidebar(){
        var sidebar = $('.sideGoodCategories',e),
            sidebarHd = sidebar.find('.sideGoodCategoriesHd'),
            sidebarBd = sidebar.find('.sideGoodCategoriesBd'),
            bdTimer = null,
            menu = $('.sideGoodCategoriesMenu',e),
            detail = $('.sideGoodCategoriesDetail',e),
            menuItems = menu.find('li'),
            detailItems = detail.find('.item'),
            menuTimer = null,
            detailTimer = null,
            isSelected = false;
        sidebarHd.hover(function (){
            sidebarBd.show();
        }, function (){
            bdTimer = setTimeout(function (){
                sidebarBd.hide();
            }, 200);
        });

        sidebarBd.mouseenter(function(){
            sidebarBd.show();
            clearTimeout(bdTimer);
        }).mouseleave(function(evt){
            if(evt.relatedTarget.id=="mask"){
                return;
            }
            bdTimer = setTimeout(function (){
//                sidebarBd.hide();
                detail.hide();
                detailItems.hide();
                $('.sideGoodCategoriesMenu .list li',e).removeClass('active');
                clearTimeout(detailTimer);
                isSelected = false;
            }, 200);
        });

        menuItems.hover(function (){
            var that = $(this);

            if (isSelected == false){
                if (that.index() != -1) {
                    clearTimeout(detailTimer);
                    detail.show();

                    menuItems.removeClass('active');
                    that.addClass('active');

                    detailItems.hide();
                    detailItems.eq(that.index()).show();
                    isSelected = true;
                }
            } else {
                if (that.index() != -1) {
                    clearTimeout(detailTimer);
                    detail.show();

                    detailTimer = setTimeout(function (){
                        menuItems.removeClass('active');
                        that.addClass('active');

                        detailItems.hide();
                        detailItems.eq(that.index()).show();
                    }, 200)
                }
                isSelected = true;
            }

        }, function (){

        });

        detailItems.hover(function (){
            clearTimeout(detailTimer);
        }, function (){

        });

    }
    sidebar();



})($root, $configs);