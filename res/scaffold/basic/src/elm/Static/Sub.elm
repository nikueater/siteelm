module Static.Sub exposing (main)

import Html exposing (Html, a, div, h2, nav, text)
import Html.Attributes exposing (class, href)
import Json.Decode as D exposing (Decoder)
import Markdown
import Siteelm.Html as Html
import Siteelm.Html.Attributes exposing (charset, rel)
import Siteelm.Page exposing (Page, page)
import Static.View as View


main : Page Preamble
main =
    page
        { decoder = preambleDecoder
        , head = viewHead
        , body = viewBody
        }


type alias Preamble =
    { title : String
    }


preambleDecoder : Decoder Preamble
preambleDecoder =
    D.map Preamble
        (D.field "title" D.string)


viewHead : Preamble -> String -> List (Html Never)
viewHead preamble _ =
    [ Html.meta [ charset "utf-8" ]
    , Html.title [] (preamble.title ++ "| sample site")
    , Html.link [ rel "stylesheet", href "/style.css" ]
    , Html.link [ rel "stylesheet", href "https://fonts.googleapis.com/css?family=Questrial&display=swap" ]
    ]


viewBody : Preamble -> String -> List (Html Never)
viewBody preamble body =
    [ View.header
    , div []
        [ nav []
            [ a [ href "/", class "prev" ] [ text "home" ]
            ]
        , h2 [] [ text preamble.title ]
        , div [ class "inner" ]
            [ Markdown.toHtml [] body
            ]
        ]
    ]
