module Static.Basic exposing (main)

import Html exposing (Html, a, div, h2, img, li, text, ul)
import Html.Attributes exposing (alt, class, href, name, src)
import Json.Decode as D exposing (Decoder)
import Markdown
import Siteelm.Html as Html
import Siteelm.Html.Attributes exposing (charset, content, rel)
import Siteelm.Page exposing (Page, page)
import Static.View as View


main : Page Preamble
main =
    page
        { decoder = preambleDecoder
        , head = viewHead
        , body = viewBody
        }


{-| Preamble is what you write on the head of the content files.
-}
type alias Preamble =
    { title : String
    , products : List Product
    , recommends : List Product
    , articles : List Article
    }


type alias Product =
    { name : String
    , price : Int
    }


type alias Article =
    { url : String
    , title : String
    , date : String
    }


{-| Preamble is passed as a JSON string. So it requires a decoder.
-}
preambleDecoder : Decoder Preamble
preambleDecoder =
    D.map4 Preamble
        (D.field "title" D.string)
        (D.field "products" (D.list productDecoder))
        (D.field "recommends" (D.list productDecoder))
        (D.field "articles" (D.list articleDecoder))


productDecoder : Decoder Product
productDecoder =
    D.map2 Product
        (D.field "name" D.string)
        (D.field "price" D.int)


articleDecoder : Decoder Article
articleDecoder =
    D.map3 Article
        (D.field "url" D.string)
        (D.field "title" D.string)
        (D.field "date" D.string)


{-| Make contents inside the _head_ tag.
-}
viewHead : Preamble -> String -> List (Html Never)
viewHead preamble _ =
    [ Html.meta [ charset "utf-8" ]
    , Html.title [] (preamble.title ++ " | siteelm")
    , Html.meta [ name "description", content "this is a simple static site generator for elm" ]
    , Html.link [ rel "stylesheet", href "/style.css" ]
    , Html.link [ rel "stylesheet", href "https://fonts.googleapis.com/css?family=Questrial&display=swap" ]
    , Html.link [ rel "stylesheet", href "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/styles/default.min.css" ]
    , Html.script "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/highlight.min.js" ""
    , Html.script "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/languages/elm.min.js" ""
    , Html.script "" "hljs.initHighlightingOnLoad();"
    ]


{-| Make contents inside the _body_ tag. The parameter "body" is usually something like markdown.
-}
viewBody : Preamble -> String -> List (Html Never)
viewBody preamble body =
    [ View.header
    , div
        [ class "main" ]
        [ img [ src "/images/header.svg", alt "" ] []
        , div []
            [ h2 [] [ text "body text" ]
            , div [ class "inner" ]
                [ text "since the body text is just a string, give it to a markdown parser"
                , Markdown.toHtml [] body
                ]
            ]
        , div []
            [ h2 [] [ text "dynamic components" ]
            , div [ class "inner" ]
                [ text "with Browser.element, dynamic contents can be embedded"
                , Html.dynamic
                    { moduleName = "Dynamic.Counter"
                    , flags = "{value: 100}"
                    }
                ]
            ]
        , div []
            [ h2 [] [ text "preamble" ]
            , div [ class "inner" ]
                [ text "you can write YAML in the preamble section"
                , viewProducts preamble.products
                , text "external YAML files can be imported"
                , viewProducts preamble.recommends
                ]
            ]
        , div []
            [ h2 [] [ text "get preambles in a directory" ]
            , div [ class "inner" ]
                [ div []
                    [ text "Use \"preamblesIn\" parameter to get preambles of files in a specified directory."
                    ]
                , div []
                    [ text "Be aware that there are some parameters which Siteelm automatically sets in an preamble. At the moment, a property \"url\" is that."
                    ]
                , ul []
                    (List.map
                        viewArticle
                        preamble.articles
                    )
                ]
            ]
        ]
    ]


viewArticle : Article -> Html Never
viewArticle article =
    li []
        [ a [ href article.url ]
            [ text article.title
            ]
        ]


viewProducts : List Product -> Html Never
viewProducts =
    ul [ class "products" ]
        << List.map
            (\x ->
                li []
                    [ div [] [ text x.name ]
                    , div [] [ text ("¥" ++ String.fromInt x.price) ]
                    ]
            )
