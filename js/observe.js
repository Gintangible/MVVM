function Observe(data) {
    this.data = data;
    this.walk(data);
}

Observe.prototype = {
    constructor: Observe,
    walk: function(data) {
        Object.keys(data).forEach(key => {
            this.convert(key, data[key]);
        });
    },
    convert(key, val) {
        this.defineReactive(this.data, key, val);
    },
    defineReactive(data, key, val) {
        // 添加 dep
        var dep = new Dep();
        observe(val);
        Object.defineProperty(data, key, {
            configurable: false,
            enumerable: true,
            get: function() {
                if (Dep.target) {
                    // 添加数据
                    dep.depend();
                }

                return val;
            },
            set: function(newVal) {
                if (newVal === val) return;

                
                val = newVal;
                observe(newVal);
                // 通知watcher 更新数据
                dep.notify();
            }
        });
    }
};

function observe(val) {
    if (val && !isPlainObject(val)) {
        return;
    }

    return new Observe(val);
}

var uid = 0;

function Dep() {
    this.id = uid++;
    this.subs = [];
}

Dep.prototype = {
    constructor: Dep,
    depend() {
        Dep.target.addDep(this)
    },
    addSub(sub) {
        this.subs.push(sub);
    },

    removeSub(sub) {
        var index = this.subs.indexOf(sub);

        if (index > -1) {
            this.subs.splice(index, 1);
        }
    },
    notify: function() {
        this.subs.forEach(sub => {
            sub.update();
        });
    }
};

Dep.target = null;
