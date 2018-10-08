/**
 * Created with IntelliJ IDEA.
 * User: mac
 * Date: 13-7-10
 * Time: 下午10:51
 * To change this template use File | Settings | File Templates.
 */
/*global ko: false */
/*global console: false */

var ShellObjectCount = 0;
function ShellObject(params) {
    if(!params){
        params = {};
    }

    this.page = null;
    this.id = ko.observable(ShellObjectCount++);
    this.name = ko.observable(params.name);
    this.objType = ko.observable(params.objType);
    if(!params.width){params.width=1};
    if(!params.height){params.height=1};
    this.width = ko.observable(params.width * 160 -10);
    this.height = ko.observable(params.height * 150 -10);
    this.top = ko.observable(params.top * 150);
    this.left = ko.observable(params.left * 160);
    this.top.extend({ notify: 'always' });
    this.left.extend({ notify: 'always' });
    this.ownerDraw = ko.observable(params.ownerDraw);
    this.url = ko.observable(params.url);
    this.icon = ko.observable(params.icon);
    this.isApp = function(){
        return (this.objType()==='app');
    };
    this.isFolder = function(){
        return (this.objType()==='folder');
    };
    this.isWidget = function(){
        return (this.objType()==='widget');
    };
    this.contains = function(x,y){
        //判断两个shell object是否有交叉
        var t = this.top(), l = this.left(),w = this.width(),h=this.height();
        if(x>=l && x<l+w && y>=t && y<t+h){
            return true;
        }
        else{
            return false;
        }
    };
    this.overlap = function(t,l,w,h){
        if(this.contains(t,l) || this.contains(t,l+w-1) || this.contains(t+h-1,l) || this.contains(t+h-1,l+w-1)){
            return true;
        }
        return false;
    };
}