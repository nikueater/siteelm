module Static.View exposing (header)

import Html exposing (Html, a, div, img, text)
import Html.Attributes exposing (alt, class, height, href, src, width)


header : Html Never
header =
    div [ class "header" ]
        [ div [ class "stripe" ]
            [ a [ href "https://github.com/nikueater/siteelm" ]
                [ img [ src "/images/github.svg", width 48, height 48, alt "git hub" ] []
                ]
            ]
        , a [ href "/" ]
            [ img [ class "logo", src "/images/logo.svg", width 320, height 160, alt "siteelm" ] []
            ]
        ]
