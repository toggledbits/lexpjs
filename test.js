var lexp = require("./lexp.js");
console.log(lexp);

var ctx = {
    __lvar: {},
    entity: {
        id: "house>123",
        name: "Some Switch",
        attributes: {
            "power_switch.state": true
        }
    },
    pi: 3.14159265
};

var exp = 'join({3,5,7},"::")';

console.log("Expression:",exp);
var t1 = Date.now();
console.log(lexp.evaluate(exp, ctx));
console.log("Parse time:",Date.now()-t1,"ms");
