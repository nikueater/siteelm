<img src='res/img/siteelm.svg' width='480' alt='siteelm'>

0.1.0: α version

## about
It's just another static site generator for Elm, but has some features.

- you can write YAML in preamble sections 
- in a preamble, you can load external YAML files
- it's easy to mix dynamic Elm components
- to make a template, what you need to do is write preamble models, its decoders, and Html Never

## usage
### install
```sh
npm install -g elm
npm install -g siteelm
```

### init
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
The server supports file watching and auto reloading.

### building
```sh
% cd mysite
% siteelm make -o
```
