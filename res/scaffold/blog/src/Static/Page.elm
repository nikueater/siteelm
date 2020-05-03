module Static.Page exposing (main)

import Element exposing (..)
import Html exposing (Html)
import Html.Attributes exposing (class)
import Json.Decode as Decode exposing (Decoder, string)
import Json.Decode.Pipeline exposing (required)
import Markdown
import Siteelm.Page exposing (Page, page)
import Static.Lib.View exposing (head, headerImage, pageLayout)


main : Page Preamble
main =
    page
        { decoder = preambleDecoder
        , head = head
        , body = body
        }


type alias Preamble =
    { title : String
    , image : String
    }


preambleDecoder : Decoder Preamble
preambleDecoder =
    Decode.succeed Preamble
        |> required "title" string
        |> required "image" string


body : Preamble -> String -> List (Html Never)
body preamble markdown =
    pageLayout <|
        column
            [ width fill
            , spacing 8
            , clipX
            ]
            [ headerImage
                { src = preamble.image
                , title = preamble.title
                }
            , paragraph
                [ width fill
                , paddingXY 0 20
                ]
                [ html (Markdown.toHtml [ class "md" ] markdown) ]
            ]
