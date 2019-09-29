<img src='https://github.com/nikueater/siteelm/raw/master/res/img/siteelm.svg?sanitize=true' width='420' alt='siteelm'>

VERSION: α(0.1.4)  
NODE_VERSION: v12.2.0

demo: https://siteelm.netlify.com/ ([source](/res/scaffold/basic))

## about
It's just another static site generator for Elm, but has some features.

- you can write YAML in preamble sections 
- in a preamble, you can load external YAML files
- it's easy to mix dynamic Elm components
- to make a template, what you need to do is write preamble models, its decoders, and Html Never

## usage
### install
```sh
% npm install -g elm
% npm install -g siteelm
```
or if you'd like to do everything locally,
```sh
% npm install -D elm siteelm
```
in this case, type _"% npx siteelm 〜"_ instead of single "siteelm" 

### initialize project
```sh
% mkdir mysite
% cd mysite
% siteelm init
```
Then you'll see a scaffold in the directory.


### developing
```sh
% cd mysite
% siteelm server -d
```
Then access "http://localhost:3000/"  
The server supports file watching and auto reloading.

### building
```sh
% cd mysite
% siteelm make -o
```
