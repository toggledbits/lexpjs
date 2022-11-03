*lexpjs* by default allows Unicode characters in identifiers (variable and
function names).

In order to support the Unicode character patterns required by the *lexpjs*
grammar for Unicode-friendly identifiers, the jison-lex file `regexp-lexer.js`
has to be modified. The function `prepareRules()` iterates over the `rules`
array. For each rule, the pattern is pulled into `m`, and `m` is checked to see
if it's a string. If so, it goes through macro substitution, and then a
`new RegExp` is compiled. This compilation must be modified with the addition
of the "u" flag for the Unicode property escapes to work:

```
    m = rules[i][0];
    if (typeof m === 'string') {
        for (k in macros) {
            if (macros.hasOwnProperty(k)) {
                m = m.split("{" + k + "}").join('(' + macros[k] + ')');
            }
        }
-       m = new RegExp("^(?:" + m + ")", caseless ? 'i':'');
+       /* toggledbits: detect Unicode pattern and set RegExp flag */
+       var unicode = m.match( /\\p\{/i ) ? 'u' : '';
+       m = new RegExp("^(?:" + m + ")", unicode + (caseless ? 'i':''));
    }
    newRules.push(m);
```

If you don't need Unicode-friendly identifiers, then you can skip the
modification suggested here, and instead enable the non-Unicode pattern in
`grammar.jison` (search for IDENTIFIER in that file to find the patterns).

<small>Updated: 2022-Nov-03</small>
