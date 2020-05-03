---
module: Static.Page
title: Installation
image: /images/header_02.jpg
---

## initialize a project

```shell
% npm init -y
% npm install -D elm siteelm
% npx siteelm init
```

Then you'll see a scaffold in the directory.

## develop

```shell
% npx siteelm server -d
```

Then access "http://localhost:3000/"  
The server supports file watching and auto reloading. If you don't need the server, use _siteelm watch_ instead.


## build

```shell
% npx siteelm make -o
```
