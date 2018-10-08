//#import Util.js

var PushManagementQuery = (function () {
    var f = {
        getQuery: function getQuery(searches) {
            if (typeof searches == "undefined") {
                return [];
            }
            var searchQuery = [];
            //索引对象类型
            searchQuery.push({n: 'ot', v: "PushManagementService", type: 'term'});
            //id
            if (searches.id && searches.id != "") {
                searchQuery.push({n: 'id', v: searches.id, type: 'text', op: "and"});
            }
            //关键字搜索
            if (searches.keyword && searches.keyword != "") {
                searchQuery.push({n: 'keyword_text', v: searches.keyword, type: 'text', op: "and"});
            }
            //一般性搜索
            if (searches.pushTarget_value && searches.pushTarget_value != "") {
                searchQuery.push({n: 'pushTarget_value', v: searches.pushTarget_value, type: 'text', op: "and"});
            }
            if (searches.toTriggerState_value && searches.toTriggerState_value != "") {
                searchQuery.push({
                    n: 'toTriggerState_value',
                    v: searches.toTriggerState_value,
                    type: 'text',
                    op: "and"
                });
            }
            if (searches.pushServer_value && searches.pushServer_value != "") {
                searchQuery.push({n: 'pushServer_value', v: searches.pushServer_value, type: 'text', op: "and"});
            }
            if (searches.pushContentSetUp_value && searches.pushContentSetUp_value != "") {
                searchQuery.push({
                    n: 'pushContentSetUp_value',
                    v: searches.pushContentSetUp_value,
                    type: 'text',
                    op: "and"
                });
            }
            if (searches.pushStatement_value && searches.pushStatement_value != "") {
                searchQuery.push({n: 'pushStatement_value', v: searches.pushStatement_value, type: 'text', op: "and"});
            }
            if (searches.pushContent_value && searches.pushContent_value != "") {
                searchQuery.push({n: 'pushContent_value', v: searches.pushContent_value, type: 'text', op: "and"});
            }
            //创建时间
            /*  var searchCreateTime = false;
              var createTimeQueryItem = {n: 'createTime', type: 'range', op: "and"};
              if (searches.beginCreateTime && searches.beginCreateTime != "") {
                  createTimeQueryItem.low = searches.beginCreateTime;
                  searchCreateTime = true;
              }
              if (searches.endCreateTime && searches.endCreateTime != "") {
                  createTimeQueryItem.high = searches.endCreateTime;
                  searchCreateTime = true;
              }
              if (searchCreateTime) {
                  searchQuery.push(createTimeQueryItem);
              }*/
            return searchQuery;
        },
        getQueryArgs: function (searchParams) {
            var qValues = f.getQuery(searchParams);
            var queryArgs = {
                mode: 'adv',
                q: qValues
            };
            return JSON.stringify(queryArgs);
        }


    };
    return f;

})();