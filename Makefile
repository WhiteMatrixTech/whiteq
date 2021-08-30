
.PHONY: clean build test install
all: build

clean:
	rm -rf `find packages -name yarn.lock`
	rm -rf `find . -name package-lock.json`
	rm -rf `find . -name dist`
	rm -rf `find . -name node_modules`

install:
	yarn install

build:
	yarn run build

test:
	yarn test:cov
