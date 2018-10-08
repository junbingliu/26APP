//#import @handlers/util.jsx
var DataProcessor = function(pageData){
    var self = this;
    self.listeners = {};
    self.pageData = pageData;
    self.on = function(spec,callback){
       if(!self.listeners[spec]){
           self.listeners[spec]=[];
       }
       self.listeners[spec].push(callback);
    };

    self.isMatch = function(dataSpec,listenerSpec){
        if(!dataSpec || !dataSpec.id){
            return false;
        }
        var dataId = dataSpec.id.replace(":","\.");
       if(listenerSpec.id ){
         if(listenerSpec.id!=dataId){
             return false;
         }
       }
       if(listenerSpec.type){
           if (listenerSpec.type!=dataSpec.type){
               return false;
           }
       };
        if(listenerSpec.subType){
            if (listenerSpec.subType!=dataSpec.subType){
                return false;
            };
        };

        return true;
    };
    self.parseListenerSpec = function(listenerSpec){
        function indexOfAny(str,delimit,start){
            for(var i=0; i<delimit.length; i++){
                var c = delimit[i];
                var idx = str.indexOf(c,start);
                if(idx>-1){
                    return idx;
                }
            };
            return -1;
        };
        function getWord(c){
            var pos = listenerSpec.indexOf(c);
            if(pos<0){
                return null;
            }
            var pos2 = indexOfAny(listenerSpec,[':','@','#'],pos);
            pos = pos + 1;
            if(pos2>0){
                return listenerSpec.substring(pos,pos2);
            }
            else{
                return listenerSpec.substring(pos);
            }
        };
        var id = getWord("#");
        var type = getWord(":");
        var subType = getWord("@");
        return {id:id,type:type,subType:subType};
    };
    self.run = function(){
        var dataSpecs = self.pageData["_all"];
        var listenerSpecs = Object.getOwnPropertyNames(self.listeners) ;
        if(!dataSpecs || !listenerSpecs){
            return;
        };
        listenerSpecs.forEach(function(listenerSpec){
            var listenerSpecRec = self.parseListenerSpec(listenerSpec);
            if(listenerSpecRec && listenerSpecRec.id=='all'){
                self.listeners[listenerSpec].forEach(function(callBack){
                    if(callBack){
                        callBack(self.pageData,[],[]);
                    }
                });
                return;
            }
            var dataIds = [];
            var dataElems = [];
            dataSpecs.forEach(function(dataSpec){
                if(self.isMatch(dataSpec,listenerSpecRec)){
                    var dataElem = getPageDataProperty(self.pageData,dataSpec.id);

                    if(dataElem){
                        dataIds.push(dataSpec.id);
                        dataElems.push(dataElem);
                    }
                    else{
                    };
                };
            });
            self.listeners[listenerSpec].forEach(function(callBack){
                if(callBack){
                    callBack(self.pageData,dataIds,dataElems);
                }
            });
        });
    };
};
var dataProcessor = new DataProcessor();