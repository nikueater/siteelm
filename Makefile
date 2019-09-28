all: deploy

deploy:
	npm install -g elm siteelm
	cd res/scaffold/basic; siteelm make -o

