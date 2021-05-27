all: test

.parser: grammar.jison
	jison -o .parser -m js grammar.jison

lexp.js: .parser umd-preamble.js Makefile
	( echo "/* Version `date +%y%j.%H%M` */" ; cat umd-preamble.js ) >.wrapper
	sed -e '/@@@/r .parser' -e '/@@@/d' <.wrapper >lexp.js

test: lexp.js
	node test.js

clean:
	rm -f .parser .wrapper lexp.js
