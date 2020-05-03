module Static.View exposing (head, headerImage, pageLayout)

import Element exposing (..)
import Element.Background as Bg
import Element.Font as Font
import Html exposing (Html)
import Html.Attributes exposing (href, name)
import Siteelm.Html as Html
import Siteelm.Html.Attributes exposing (charset, content, rel)


maxWidth : Int
maxWidth =
    900


bgColor : Color
bgColor =
    rgb255 232 217 188


head : { a | title : String } -> String -> List (Html Never)
head preamble _ =
    [ Html.meta [ charset "utf-8" ]
    , Html.title [] (preamble.title ++ " | siteelm blog")
    , Html.meta [ name "description", content "siteelm blog template" ]
    , Html.meta [ name "viewport", content "width=device-width,initial-scale=1" ]
    , Html.link [ rel "stylesheet", href "/markdown.css" ]
    , Html.link [ rel "stylesheet", href "/counter.css" ]
    , Html.link [ rel "stylesheet", href "https://fonts.googleapis.com/css?family=Questrial&display=swap" ]
    , Html.link [ rel "stylesheet", href "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/styles/default.min.css" ]
    , Html.script "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/highlight.min.js" ""
    , Html.script "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/languages/elm.min.js" ""
    , Html.script "" "hljs.initHighlightingOnLoad();"
    ]


pageLayout : Element Never -> List (Html Never)
pageLayout child =
    List.singleton <|
        layout
            [ width fill
            , height fill
            , Font.color (rgb255 66 66 66)
            ]
            (column
                [ width fill
                , height fill
                ]
                [ header
                , el
                    [ width fill
                    , height fill
                    , Bg.color bgColor
                    , paddingXY 0 20
                    ]
                    (el
                        [ width (maximum maxWidth fill)
                        , centerX
                        ]
                        child
                    )
                , footer
                ]
            )


header : Element Never
header =
    let
        content ( url, name ) =
            link
                [ alignRight
                , paddingXY 8 0
                ]
                { url = url
                , label = text name
                }
    in
    column
        [ width (maximum maxWidth fill)
        , centerX
        ]
        [ row
            [ width fill ]
            [ link []
                { url = "/"
                , label =
                    image
                        [ width (px 128)
                        , height (px 96)
                        ]
                        { src = "/images/logo.png"
                        , description = "siteelm"
                        }
                }
            , wrappedRow
                [ Font.bold
                , Font.size 14
                , padding 0
                , width fill
                ]
                (List.map content
                    [ ( "/about", "ABOUT" )
                    , ( "/installation", "INSTALLATION" )
                    ]
                    ++ [ link []
                            { url = "https://github.com/nikueater/siteelm"
                            , label =
                                image
                                    [ width (px 48)
                                    , height (px 48)
                                    ]
                                    { src = "/images/github.svg"
                                    , description = "github"
                                    }
                            }
                       ]
                )
            ]
        ]


footer : Element Never
footer =
    el
        [ width fill
        , Bg.color bgColor
        , paddingXY 0 8
        ]
        (row
            [ centerX
            , Font.size 12
            ]
            [ text "powered by "
            , link [ Font.color (rgb255 80 80 250) ]
                { url = "https://github.com/nikueater/siteelm"
                , label = text "siteelm"
                }
            ]
        )


headerImage : { title : String, src : String } -> Element Never
headerImage { title, src } =
    el
        [ width (maximum maxWidth fill)
        , height (px 300)
        , clipX
        , clipY
        ]
    <|
        el
            [ width fill
            , height fill
            , padding 16
            , clipX
            , behindContent
                (image
                    [ height (maximum 300 fill)
                    , centerX
                    , clipX
                    ]
                    { src = src
                    , description = ""
                    }
                )
            , Font.color (rgb255 250 250 250)
            , Font.size 32
            , Font.bold
            ]
            (el [ centerY ] (text title))
