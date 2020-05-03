
all: library


library: 
	npm run build

demo:
	npm install -g elm siteelm
	npm install
	npm run build
	cd res/scaffold/blog; siteelm make -o

demo-basic:
	cd res/scaffold/basic; siteelm server

demo-blog:
	cd res/scaffold/blog; siteelm server
