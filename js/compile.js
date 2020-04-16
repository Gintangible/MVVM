function Compile(el, vm) {
    this.$vm = vm;
    this.$el = this.isElmentNode(el) ? el : document.querySelector(el);

    if (this.$el) {
        this.$fragment = this.node2fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    constructor: Compile,
    node2fragment(el) {
        var fragment = document.createDocumentFragment(),
            child;

        while ((child = el.firstChild)) {
            fragment.appendChild(child);
        }

        return fragment;
    },
    init() {
        this.compileElement(this.$fragment);
    },
    compileElement(node) {
        var childNodes = node.childNodes;

        Array.from(childNodes).forEach(child => {
            var text = child.textContent,
                reg = /\{\{(.*)\}\}/;

            if (this.isElmentNode(child)) {
                // 解析指令 v-
                this.compileDirect(child);
            } else if (this.isTextNode(child) && reg.test(text)) {
                this.compileText(node, RegExp.$1);
            }

            if (child.childNodes && child.childNodes.length) {
                this.compileElement(child);
            }
        });
    },
    compileDirect(node) {
        var nodeAttrs = node.attributes;

        Array.from(nodeAttrs).forEach(attr => {
            var attrName = attr.name;

            if (this.isDirective(attrName)) {
                var exp = attr.value,
                    dir = attrName.substring(2);

                if (this.isEventDirect(dir)) {
                    compileUtil.eventHandler(node, this.$vm, exp, dir);
                } else {
                    compileUtil[dir] && compileUtil[dir](node, this.$vm, exp);
                }

                // 解析完后移除
                node.removeAttribute(attrName);
            }
        });
    },
    compileText: function(node, reg) {
        compileUtil.text(node, this.$vm, reg);
    },
    isDirective(dir) {
        return dir.indexOf('v-') > -1;
    },
    isEventDirect(dir) {
        return dir.indexOf('on:') > -1;
    },
    isElmentNode(node) {
        return node.nodeType === 1;
    },
    isTextNode(node) {
        return node.nodeType === 3;
    }
};

var compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },
    html: function(node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },
    class: function(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },
    model: function(node, vm, exp) {
        this.bind(node, vm, exp, 'model');
    },
    bind: function(node, vm, exp, dir) {
        var updateFn = updater[dir + 'Updater'];

        updateFn && updateFn(node, this._getVMVal(vm, exp));

        new Watcher(vm, exp, function(val, oldVal) {
            updateFn && updateFn(node, val);
        })
    },
    eventHandler(node, vm, exp, dir) {
        var eventType = dir.split(':')[1],
            fn = vm.$options.methods && vm.$options.methods[exp];

        eventType && fn && node.addEventListener(eventType, fn.bind(vm), false);
    },
    _getVMVal: function(vm, exp) {
        var val = vm._data,
            expArray = exp.split('.');

        expArray.forEach(e => {
            val = val[e];
        });

        return val;
    }
};

var updater = {
    textUpdater: function(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    htmlUpdater: function(node, value) {
        node.innerHTML = typeof value == 'undefined' ? '' : value;
    },
    classUpdater: function(node, value) {
        value && node.classList.add(value);
    },
    modelUpdater: function(node, value) {
        node.value = typeof value == 'undefined' ? '' : value;
    }
};
