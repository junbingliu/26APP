/**
 * Created with IntelliJ IDEA.
 * User: mac
 * Date: 13-7-25
 * Time: 下午3:07
 * To change this template use File | Settings | File Templates.
 */
function ActiveApp(){
    this.appId = ko.observable();
    this.name = ko.observable();
    this.url = ko.observable();
    this.isCurrentApp = ko.observable();
}
