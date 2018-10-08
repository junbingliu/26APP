function Option(data){
    data = data || {};
    var self = this;
    self.id = data.id;
    self.name = data.name;
}
function OptionLevel(data){
    var self = this;
    self.onChange = null;

    data = data || {};
    if(!data.options){
        data.options = [];
    }
    self.options = $.map(data.options,function(option){
        return new Option(option);
    });
    self.currentOptionId = ko.observable(null);
    self.currentOptionId(data.currentId);
    self.currentOptionId.subscribe(function(newValue) {
        if(self.onChange){
            self.onChange(self);
        }
    });
    self.currentOption = function(){
        for(var i=0;i<self.options.length;i++){
            var option = self.options[i];
            if(option.id==self.currentOptionId()){
                return option;
            }
        }
        return null;
    }
    self.currentOptionName = function(){
        for(var i=0;i<self.options.length;i++){
            var option = self.options[i];
            if(option.id==self.currentOptionId()){
                return option.name;
            }
        }
        return null;
    }
    self.nextLevel = null;
    self.levelIndex = 0;
}

function OptionSelector(){
    var self = this;
    self.onChangeHandlers = [];
    self.registerChangeHandler = function(handler){
        self.onChangeHandlers.push(handler);
        return self.onChangeHandlers.length-1;
    }
    self.currentOptionPathName = ko.observable();
    self.optionLevels = ko.observableArray();
    self.onLevelChange = function(optionLevel){
       self.optionLevels.splice(optionLevel.levelIndex+1,self.optionLevels().length -optionLevel.levelIndex-1 );
        $.each(self.onChangeHandlers,function(index,handler){
            handler(self,optionLevel);
        });
        self.currentOptionPathName(self.getCurrentOptionPathName());
    };
    self.setOptionLevels= function(levels){
        if(!levels){
            levels = [];
        }
        if(levels.length>0){
            var last = levels[levels.length-1];
            if(!last.options || last.options.length==0){
                levels.pop();
            }
        }
        var  optionLevels = $.map(levels,function(level){
            return new OptionLevel(level);
        });
        for(var i=0;i<optionLevels.length;i++){
            var level = optionLevels[i];
            var next = null;
            if(i<optionLevels.length-1){
                next = optionLevels[i+1];
            }
            level.nextLevel = next;
            level.levelIndex = i;
            level.onChange = self.onLevelChange;
        }
        self.optionLevels(optionLevels);
        self.currentOptionPathName(self.getCurrentOptionPathName());

    }
    self.addOptionLevel = function(level){
        if(!level || !level.options || level.options.length==0){
            return;
        }
        var optionLevel =  new OptionLevel(level);
        var levels = self.optionLevels();
        levels.push(optionLevel);
        for(var i=0;i<levels.length;i++){
            var level = levels[i];
            var next = null;
            if(i<levels.length-1){
                next = levels[i+1];
            }
            level.nextLevel = next;
            level.levelIndex = i;
            level.onChange = self.onLevelChange;
        }
        self.optionLevels(levels);
        self.currentOptionPathName(self.getCurrentOptionPathName());
    }
    self.onNewLevel = function(newOptionLevel){
        newOptionLevel.levelIndex = self.optionLevels.length;
        self.optionLevels.push(newOptionLevel);
    }
    self.getCurrentOption = function(){
        if(!self.optionLevels() || self.optionLevels().length==0){
            return null;
        }
        var levels = self.optionLevels();
        for(var i=levels.length-1; i>=0;i--){
            var level = levels[i];
            if(level.currentOptionId()){
                return level.currentOption();
            }
        }
    }

    self.getCurrentOptionId = function(){
        if(!self.optionLevels() || self.optionLevels().length==0){
            return null;
        }
        var levels = self.optionLevels();
        for(var i=levels.length-1; i>=0;i--){
            var level = levels[i];
            if(level.currentOptionId()){
                return level.currentOptionId();
            }
            else{
                return null;
            }
        }
    }


    self.getCurrentOptionPath = function(){
        var path = [];
        var levels = self.optionLevels();
        for(var i=0; i<levels.length;i++){
            var level = levels[i];
            var currentOption = level.currentOption();
            if(currentOption){
                path.push(currentOption);
            }
            else{
                break;
            }
        }
        return path;
    }
    self.getCurrentOptionPathName = function(){
        var path = self.getCurrentOptionPath();
        var names = [];
        $.each(path,function(index,elem){
            names.push(elem.name);
        });
        return names.join("");
    }

}


