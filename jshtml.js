(function() {
    var compiler = this.jshtml.compiler(true);
    this.jshtml.template = function(script, context) {
        script = compiler(script);

        var genScript = '(function(';
        var args = [ ];
        if(context) {
            var first = true;
            for(var property in context) {
                if(context.hasOwnProperty(property)) {
                    genScript += (first ? '' : ',') + property;
                    args.push(context[property]);
                    first = false;
                }
            }
        }
        genScript += '){' + script + '});';
        exec = eval(genScript);
 
        return function(thisObject) {
            return exec.apply(thisObject, args);
        };
    };
}).call(this);