#
# Prerequisites to build:
#     * Install dependencies: npm i --no-package-lock
#     * See README-lexer.md for changes needed to `jison-lex` package.

all: test

.parser: grammar.jison Makefile
	@#jison -o .parser -m js grammar.jison
	NODE_PATH=`pwd` node ./node_modules/jison/lib/cli.js -o .parser -m js grammar.jison

lexp.js: .parser umd-preamble.js Makefile
	( echo "/* Version `date +%y%j.%H%M` */" ; cat umd-preamble.js ) >.wrapper
	sed -e '/@@@/r .parser' -e '/@@@/d' <.wrapper >lexp.js

test: lexp.js
	node test.js

clean:
	rm -f .parser .wrapper lexp.js
