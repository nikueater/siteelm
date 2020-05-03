module Static.Article exposing (main)

import Element exposing (..)
import Element.Font as Font
import Html exposing (Html)
import Html.Attributes exposing (class)
import Iso8601
import Json.Decode as Decode exposing (Decoder, string)
import Json.Decode.Pipeline exposing (required)
import Markdown
import Siteelm.Page exposing (Page, page)
import Static.View exposing (head, pageLayout)
import Time exposing (Posix)


main : Page Preamble
main =
    page
        { decoder = preambleDecoder
        , head = head
        , body = body
        }


type alias Preamble =
    { title : String
    , date : Posix
    }


preambleDecoder : Decoder Preamble
preambleDecoder =
    Decode.succeed Preamble
        |> required "title" string
        |> required "date" Iso8601.decoder


body : Preamble -> String -> List (Html Never)
body preamble markdown =
    let
        date =
            preamble.date
                |> Iso8601.fromTime
                |> String.split "T"
                |> List.head
                |> Maybe.withDefault ""
    in
    pageLayout <|
        column
            [ width (maximum 720 fill)
            , centerX
            , paddingXY 20 0
            , spacing 8
            ]
            [ paragraph
                [ Font.size 36
                , Font.bold
                , centerX
                , clipX
                , Font.center
                ]
                [ text preamble.title
                ]
            , el
                [ Font.size 14
                , Font.bold
                , centerX
                ]
                (text date)
            , paragraph
                [ width fill
                , paddingXY 0 20
                ]
                [ html (Markdown.toHtml [ class "md" ] markdown) ]
            ]
