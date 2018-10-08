$(document).ready(function () {

    $("ul li.sn_menu").mouseenter(function(){
        $(this).addClass("hover");
        $(this).children().next().attr("style","display:block");
    }).mouseleave(function(){
            $(this).removeClass("hover");
            $(this).children().next().attr("style","display:none");
        });
    $(".topUcenter").mouseenter(function(){
        $(this).addClass("hover");
        $(this).children().next().attr("style","display:block");
    }).mouseleave(function(){
        $(this).removeClass("hover");
        $(this).children().next().attr("style","display:none");
    });

    /*自动轮播*/
    var autoScroll=setInterval(setCur,6000);

    $(".slide_adv,#pic").mouseenter(function(){
        clearInterval(autoScroll);
    }).mouseleave(function(){
            autoScroll=setInterval(setCur,6000);
        })
    function setCur(){
        var ele=$("[data-id='slide_banner'] li[class='cur']").next();
        var ele2=$("[data-id='slide_banner'] b[class='cur']").next();
        if(ele.length==0){
            ele=$("[data-id='slide_banner'] li").eq(0);
        }
        if(ele2.length==0){
            ele2=$("[data-id='slide_banner'] b").eq(0);
        }
        ele.trigger("mouseenter");
        ele2.trigger("mouseenter");
    }
    /* mallCategory begin*/
    var shouldShow=$(".mallCategory").attr("categoryShow");
    if(shouldShow && shouldShow=='T'){
       return;
    }
    else{

        $(".mallCategory").mouseenter(function(){
            $(".sort",this).fadeIn(300);
        }).mouseleave(function(){
                $(".sort",this).hide();
            });
    }

    var pathname=location.href;
    $.each($(".nav li a"), function(i, n){
        var href=$(n).attr("href");
        if(pathname.indexOf(href)>-1){
            $(".nav li a").removeClass("cur");
            $(n).addClass("cur");
        }

    });
    /*mallCategory end */

    var tempObj=$(".mod_rank ul li").eq(0);
    /**一周销量鼠标划上去效果**/
    $(".mod_rank ul li").mouseenter(function(){
        $(".mod_rank ul li").removeClass("cur");
        if(tempObj){
            $(tempObj).find(".pic,.cont").hide();
            $(tempObj).find("a").eq(0).show();
        }
        $(this).addClass("cur");
        $(this).find(".pic,.cont").show();
        $(this).find("a").eq(0).hide();
        tempObj=this;
    })

});


