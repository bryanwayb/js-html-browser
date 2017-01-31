(function() {
    'use strict';

    var compiler = function(returnConcat) {
        var BeginOutputCode = 'process.stdout.write(',
            EndOutputCode = ');',
            BeginOutputCodeSection = '(',
            EndOutputCodeSection = ')',
            ConcatCode = '+',
            BeginHTMLBlock = '\'',
            EndHTMLBlock = '\'',
            CodeBlockStartTag = '<?js',
            CodeBlockStartTagLength = CodeBlockStartTag.length,
            CodeBlockEndTag = '?>',
            CodeBlockEndTagLength = CodeBlockEndTag.length,
            CodeDirectOutChar = ':',
            CodeBlockRegexWhitespace = /\s/m,
            CodeBlockRegexCheckEnd = /(\/\/.+?\n|\/\*(.|[\n\r\f])+?\*\/|[^\\]\'((\\\')|(\\\\)|([^\']?))+\'?|[^\\]\"((\\\")|(\\\\)|([^\"]?))+\"?|\?\>)/gm,
            SanitizeRegexBackslash = /\\/gm,
            SanitizeRegexBackspace = /\u0008/gm,
            SanitizeRegexTab = /\t/gm,
            SanitizeRegexNewline = /\n/gm,
            SanitizeRegexVerticalTab = /\v/gm,
            SanitizeRegexFeed = /\f/gm,
            SanitizeRegexReturn = /\r/gm,
            SanitizeRegexDoubleQuote = /\"/gm,
            SanitizeRegexQuote = /\'/gm;

        if(returnConcat) {
            BeginOutputCode = '_$+=';
            EndOutputCode = ';';
        }

        function sanitizeRaw(escapedStr) {
            return escapedStr
                .replace(SanitizeRegexBackslash, '\\\\')
                .replace(SanitizeRegexBackspace, '\\b')
                .replace(SanitizeRegexTab, '\\t')
                .replace(SanitizeRegexNewline, '\\n')
                .replace(SanitizeRegexVerticalTab, '\\v')
                .replace(SanitizeRegexFeed, '\\f')
                .replace(SanitizeRegexReturn, '\\r')
                .replace(SanitizeRegexDoubleQuote, '\\\"')
                .replace(SanitizeRegexQuote, '\\\'');
        }

        return function(buffer) {
            var ret = '',
                inText = true,
                concat = false,
                pos = 0,
                lastPos = 0,
                len = buffer.length;

            while(pos < len) {
                if(inText) {
                    pos = buffer.indexOf(CodeBlockStartTag, pos);
                    if(pos === -1) {
                        pos = len;
                    }

                    inText = false;
                    if(pos !== lastPos) {
                        ret += (concat ? ConcatCode : BeginOutputCode) + BeginOutputCodeSection + BeginHTMLBlock + sanitizeRaw(buffer.slice(lastPos, pos)) + EndHTMLBlock + EndOutputCodeSection;
                        concat = true;
                    }
                    pos += CodeBlockStartTagLength;
                }
                else {
                    var firstChar = buffer[pos];
                    var isDirectOut = firstChar === CodeDirectOutChar;
                    if(!isDirectOut && !CodeBlockRegexWhitespace.test(firstChar)) {
                        lastPos -= CodeBlockStartTagLength;
                        inText = true;
                        continue;
                    }
                    lastPos++;

                    var currentBuffer = buffer.slice(pos),
                    execRes;

                    var index = -1;
                    CodeBlockRegexCheckEnd.lastIndex = 0;
                    while((execRes = CodeBlockRegexCheckEnd.exec(currentBuffer))) {
                        if(execRes[0] === CodeBlockEndTag) {
                            index = execRes.index;
                            break;
                        }
                    }

                    if(index === -1) {
                        pos = len;
                    }
                    else {
                        pos += index;
                    }

                    if(isDirectOut) {
                        ret += (concat ? ConcatCode : BeginOutputCode) + BeginOutputCodeSection + buffer.slice(lastPos, pos) + EndOutputCodeSection;
                        concat = true;
                    }
                    else {
                        ret += (concat ? EndOutputCode : '') + buffer.slice(lastPos, pos);
                        concat = false;
                    }
                    pos += CodeBlockEndTagLength;

                    inText = true;
                }
                lastPos = pos;
            }

            if(concat) {
                ret += EndOutputCode;
            }

            if(returnConcat) {
                ret = 'var _$=\'\';' + ret + 'return _$;';
            }

            return ret;
        };
    };

    if(typeof module !== 'undefined' && module.exports) {
        module.exports = compiler;
    }
    else {
        if(!this.jshtml) {
            this.jshtml = {};
        }
        this.jshtml.compiler = compiler;
    }
}).call(this);
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