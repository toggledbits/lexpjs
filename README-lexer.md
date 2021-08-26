In order to support the Unicode character patterns required by the lexpjs
grammar, the jison-lex file regexp-lexer.js has been modified. The func-
tion prepareRules() iterates over the "rules" array. For each rule, the
pattern is pulled into "m", and "m" is checked to see if it's a string.
If so, it goes through macros substitution, and then a RegExp is compiled.
This compilation is modified with the addition of the "unicode" variable
and its application:

m = rules[i][0];
if (typeof m === 'string') {
    for (k in macros) {
        if (macros.hasOwnProperty(k)) {
            m = m.split("{" + k + "}").join('(' + macros[k] + ')');
        }
    }
    /* toggledbits: detect Unicode pattern and set RegExp flag */
    var unicode = m.match( /\\p\{/i ) ? 'u' : '';
    m = new RegExp("^(?:" + m + ")", unicode + ( caseless ? 'i':'' ) );
}
newRules.push(m);
