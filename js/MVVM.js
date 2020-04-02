function MVVM(options) {
    this.$options = options;

    var data = this._data = this.$options.data;

    Object.keys(data).forEach(key => {
        this._proxy(key);
    })
}

MVVM.prototype = {
    constructor: MVVM,
    _proxy: function(key) {
        Object.defineProperty(this, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return this._data[key];
            },
            set: function proxySetter(newVal) {
                this._data[key] = newVal;
            }
        })
    }
}