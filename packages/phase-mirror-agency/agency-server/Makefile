.PHONY: install build binaries start clean lint

install:
	npm install

build:
	npx tsc
	npx tsc-alias

binaries:
	bash compile_binaries.sh

start:
	npx ts-node src/index.ts

start-dev:
	npx nodemon --exec ts-node src/index.ts

dev: install start-dev

clean:
	rm -rf dist node_modules

lint:
	npx eslint src/**/*.ts
