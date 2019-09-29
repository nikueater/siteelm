---
module: Static.Basic
title: HOME
products:
    - name: Apple
      price: 100
    - name: Banana
      price: 150
recommends: 
    external: ./other.yaml
---
### Markdown
- [sub page (A)](/sub/a)
- [sub page (B)](/sub/b)


```elm
type alias Preamble = 
    { "title": "String"
    , "name": "String"
    }

decoder : Decoder Preamble
decoder =
    D.map2 Preamble
        (field "title" string)
        (field "name" string)

main : Page Preamble
main = 
    page
        { decoder = decoder
        , head = head
        , body = body
        }
.
.
.

```
