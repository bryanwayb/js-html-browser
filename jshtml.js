(function() {
    this.jshtml.template = function() {
       var genScript = '(function(';
       var args = [ ];
       if(context) {
           for(var property in context) {
               if(context.hasOwnProperty(property)) {
                   genScript += (first ? '' : ',') + property;
                   args.push(context[property]);
                   first = false;
               }
           }
       }
       genScript += '){' + script + '});';
       exec = vm.runInThisContext(genScript);
       context.__init_script(this._options.filename || __filename);

       this._function = func = function(thisObject, callback) {
           if(typeof thisObject === 'function') {
               callback = thisObject;
               thisObject = null;
           }

           if(callback) {
               context.__complete = function() {
                   callback(context.__render_end());
               };
               exec.apply(thisObject, args);
           }
           else {
               exec.apply(thisObject, args);
               return context.__render_end();
           }
       };
    };
}).call(this);