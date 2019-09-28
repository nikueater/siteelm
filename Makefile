all: deploy

deploy:
	cd res/scaffold/basic
	npm install -g elm siteelm
	siteelm make -o

