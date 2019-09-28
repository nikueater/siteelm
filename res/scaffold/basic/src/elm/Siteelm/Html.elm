module Siteelm.Html exposing (body, dynamic, head, html, link, meta, title)

import Html exposing (Attribute, Html, node)
import Siteelm.Html.Attributes exposing (data)


meta : List (Attribute msg) -> Html msg
meta attrs =
    node "meta" attrs []


link : List (Attribute msg) -> Html msg
link attrs =
    node "link" attrs []


title : List (Attribute msg) -> String -> Html msg
title attrs s =
    node "title" attrs [ Html.text s ]


head : List (Attribute msg) -> List (Html msg) -> Html msg
head attrs es =
    node "head" attrs es


html : List (Attribute msg) -> List (Html msg) -> Html msg
html attrs es =
    node "html" attrs es


body : List (Attribute msg) -> List (Html msg) -> Html msg
body attrs es =
    node "body" attrs es


dynamic : { moduleName : String, flags : String } -> Html msg
dynamic { moduleName, flags } =
    Html.div
        [ data "elm-module" moduleName
        , data "flags" flags
        ]
        []
