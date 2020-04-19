function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

function isElmentNode(node) {
    return node.nodeType === 1;
}

function isTextNode(node) {
    return node.nodeType === 3;
}