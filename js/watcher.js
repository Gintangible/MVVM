function Watcher(vm, exp, cb) {
    this.cb = cb;
    this.vm = vm;
    this.exp = exp;
    this.depIds = {};
    this.value = this.get();
}

Watcher.prototype = {
    constructor: Watcher,
    update: function() {
        this.run();
    },
    run: function() {
        var value = this.get();
        var oldValue = this.value;

        if (value != oldValue) {
            this.value = value;
            this.cb.call(this.vm, value, oldValue);
        }
    },
    addDep(dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },
    get() {
        Dep.target = this;
        var value = this.getVMVal();
        Dep.target = null;

        return value;
    },
    getVMVal() {
        var val = this.vm._data,
            expArray = this.exp.split('.');

        expArray.forEach(e => {
            val = val[e];
        });

        return val;
    }
};
