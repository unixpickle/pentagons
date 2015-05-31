.PHONY: clean test

build/pentagons.js: build
	sh skeletize.sh

build:
	mkdir build

clean:
	rm -rf build