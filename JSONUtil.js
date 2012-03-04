var JSONUtil = function (options) {
    var $this = this;
    
    this.options     = options || {maxDepth:10,showMethod:false,compact:false};
    
    function setMaxDepth(maxDepth)     { $this.maxDepth   = maxDepth; }
    function hideMethods()             { $this.showMethod = false;    }
    function showMethods()             { $this.showMethod = true;     }
    function setCompactOutput(compact) { 
        if (compact) {
            $this.tab = $this.lf = '';
        } else {
            $this.tab = '\t';
            $this.lf  = '\n';
        }
    }

    setCompactOutput(this.options.compact);

    /**
     * A more consistent version of 'typeof' that will return:
     * 
     * undefined: undefined
     * null: null
     * String: String
     * class : Object
     * integer: Number
     * Number: Number
     * cast Number: Number
     * float: Number
     * boolean: Boolean
     * Boolean: Boolean
     * Array: Array
     * Array[]: Array
     * Object{}: Object
     * 
     */
    function typeOf(object) {
        var type = Object.prototype.toString.call(object);
        type = type.substr(8, type.length-9);
        if (type === 'global') {
            if (typeof object === 'object')
                type = 'null';
            else if (object === undefined)
                type = 'undefined';
        }
        return type;
    }
    
    function stringify(obj, name, indent, depth, filter) {
        name   = name   || '';
        indent = indent || $this.tab;
        depth  = depth  || 1;
        filter = filter || [];

        indent = typeof indent === 'undefined' ? $this.tab : indent;
        depth  = typeof depth  === 'undefined' ? 1         : depth;
        
        if (filter.indexOf(name) !== -1) {
            return '';
        }
        if (depth > $this.options.maxDepth) {
            return indent + name + ': <Maximum Depth Reached>\n';
        }
        var isArray  = typeOf(obj) === 'Array';
        var isObject = typeOf(obj) === 'Object';
        if (isObject || isArray) {
            var child  = null;
            var output = indent;
            if (name !== '') output += '"' + name + '":';
            if (isArray) {
                output += '[';
            } else {
                output += '{';
            }
            output += $this.lf;
            var savedIndent = indent;
            indent += $this.tab;
            for (var item in obj) {
                try {
                    child = obj[item];
                } catch (e) {
                    child = '<Unable to Evaluate>';
                }
                if (typeOf(child) === 'Object' || typeOf(child) === 'Array') {
                    output += stringify(child, (isObject ? item : null), indent, depth + 1, filter) + ',' + $this.lf;
                } else if (typeOf(child) === 'Function') {
                    if ($this.options.showMethod)
                        output += indent + item + ': METHOD' + $this.lf;
                    else if (obj.hasOwnProperty(item)) {
                        var buffer = ("" + child).replace(/\n|\r|\s{2,}/g, ' ');
                        var capture = buffer.match(/^\s*function\s*([^(\s]+)\s*\(/);
                        if (capture !== null && capture[1] !== undefined) {
                            buffer = capture[1];
                        }
                        output += indent + '"'+ item + '": ' + buffer + ',' + $this.lf;
                    }
                } else {
                    output += indent + (isObject ? '"' + item + '": ' :'');
                    if (typeOf(child) === 'String')
                        output += '"' + child + '"';
                    else output += child;
                    output += ',' + $this.lf;
                }
            }
            // This is ugly, but it makes the code simplier.
            if (output.substr(output.length -1) === $this.lf)
                output = output.substr(0, output.length -1);
            if (output.substr(output.length -1) === ',')
                output = output.substr(0, output.length -1);
            output += $this.lf + savedIndent + (isArray ? '],' : '},') + $this.lf;
            output = output.substr(0,output.length -2);
            return output;
        } else {
            return obj;
        }
    }
    
    return  {
        "stringify"        : stringify,
        "setMaxDepth"      : setMaxDepth,
        "hideMethods"      : hideMethods,
        "showMethods"      : showMethods,
        "setCompactOutput" : setCompactOutput
    };
};

exports.JSONUtil = JSONUtil;

