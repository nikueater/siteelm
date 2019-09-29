all: deploy

deploy:
	npm install -g elm siteelm
	npm install
	npm run build
	cd res/scaffold/basic; siteelm make -o

