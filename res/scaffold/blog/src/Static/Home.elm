module Static.Home exposing (main)

import Element exposing (..)
import Element.Background as Bg
import Element.Border as Border
import Element.Font as Font
import Html exposing (Html)
import Html.Attributes exposing (class)
import Iso8601
import Json.Decode as Decode exposing (Decoder, int, list, string)
import Json.Decode.Pipeline exposing (optional, required)
import Markdown
import Siteelm.Html as Html
import Siteelm.Page exposing (Page, page)
import Static.Lib.View exposing (head, headerImage, pageLayout)
import Time exposing (Posix)


main : Page Preamble
main =
    page
        { decoder = preambleDecoder
        , head = head
        , body = body
        }


{-| Preambles is json decodable data in the head part of your md files.
When you pass a directory path to "preamblesIn," preambles sections of all files in the directory will be passed.
Also you can give a path to external yaml files with an "external" property.
-}
type alias Preamble =
    { title : String
    , articles : List Article
    , products : List Product
    }


{-| The field "url" is automatically given by Siteelm even though you don't write it.
-}
type alias Article =
    { url : String
    , title : String
    , date : Posix
    }


type alias Product =
    { name : String
    , price : Int
    }


preambleDecoder : Decoder Preamble
preambleDecoder =
    Decode.succeed Preamble
        |> required "title" string
        |> optional "articles" (list articleDecoder) []
        |> optional "products" (list productDecoder) []


articleDecoder : Decoder Article
articleDecoder =
    Decode.succeed Article
        |> required "url" string
        |> required "title" string
        |> required "date" Iso8601.decoder


productDecoder : Decoder Product
productDecoder =
    Decode.succeed Product
        |> required "name" string
        |> required "price" int


body : Preamble -> String -> List (Html Never)
body preamble markdown =
    pageLayout <|
        column
            [ width fill, clipX ]
            [ headerImage
                { src = "images/header_01.jpg"
                , title = preamble.title
                }
            , paragraph []
                [ html (Markdown.toHtml [ class "md" ] markdown)
                ]
            , articles preamble.articles
            , demo preamble
            ]


articles : List Article -> Element Never
articles items =
    column
        [ width fill
        , height fill
        ]
        (items
            |> List.sortWith
                (\a b ->
                    case compare (Time.posixToMillis a.date) (Time.posixToMillis b.date) of
                        LT ->
                            GT

                        _ ->
                            LT
                )
            |> List.map article
        )


article : Article -> Element Never
article item =
    let
        date =
            item.date
                |> Iso8601.fromTime
                |> String.split "T"
                |> List.head
                |> Maybe.withDefault ""
    in
    link
        [ width fill
        , Border.widthEach
            { top = 0
            , left = 0
            , right = 0
            , bottom = 1
            }
        , Border.dashed
        ]
        { url = item.url
        , label =
            row
                [ spacing 8
                , paddingEach
                    { top = 10
                    , left = 0
                    , right = 0
                    , bottom = 0
                    }
                ]
                [ el
                    [ Font.size 16
                    , alignBottom
                    ]
                    (text date)
                , el
                    [ Font.size 20
                    , alignBottom
                    , Font.bold
                    , Font.color (rgb255 80 80 250)
                    ]
                    (text item.title)
                ]
        }


demo : Preamble -> Element Never
demo preamble =
    let
        caption title =
            el
                [ Font.size 24
                , Font.bold
                ]
                (text title)

        product p =
            row
                [ width (px 200)
                , height (px 100)
                , Bg.color (rgb255 61 183 207)
                , padding 6
                ]
                [ el
                    [ width fill
                    , height fill
                    , centerX
                    , Font.color
                        (rgb 1 1 1)
                    , Bg.color (rgb255 255 255 255)
                    , Border.rounded 8
                    ]
                    (el
                        [ Font.color (rgb255 61 187 207)
                        , centerX
                        , centerY
                        ]
                        (text p.name)
                    )
                , el
                    [ width fill
                    , height fill
                    ]
                    (el
                        [ Font.color (rgb255 255 255 255)
                        , centerX
                        , centerY
                        ]
                        (text ("￥" ++ String.fromInt p.price))
                    )
                ]
    in
    column
        [ paddingXY 0 20
        , width fill
        , spacing 8
        , Font.size 16
        ]
        [ el
            [ Font.size 32
            , Font.bold
            ]
            (text "Demo")
        , caption "preamble"
        , paragraph
            [ width fill ]
            [ text "You can write YAML in the preamble section. And external YAML files can be imported."
            , wrappedRow
                [ spacing 8
                , centerX
                ]
                (List.map product preamble.products)
            ]
        , caption "dynamic element"
        , paragraph [ width fill ]
            [ text "With Browser.element, dynamic contents can be embedded."
            , html <|
                Html.dynamic
                    { moduleName = "Dynamic.Counter"
                    , flags = "{value: 100}"
                    }
            ]
        ]
