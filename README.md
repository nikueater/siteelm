<img src='https://github.com/nikueater/siteelm/raw/master/res/img/siteelm.svg?sanitize=true' width='420' alt='siteelm'>


demo: https://siteelm.netlify.com/ ([source](/res/scaffold/basic))

## about
It's just another static site generator for Elm, but has some features.

- you can write YAML in preamble sections 
- in a preamble, you can load external YAML files
- it's easy to mix dynamic Elm components
- simple rules to use

## concept
to make a template, what you need to do is writing preamble models, their decoder, and two functions return Html Never (for HEAD and BODY)

<img src='https://github.com/nikueater/siteelm/raw/master/res/img/about.svg?sanitize=true' width='420' alt='siteelm'>


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
in this case, type _"% npx siteelm 〜"_ instead of _"% siteelm 〜"_ 

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
