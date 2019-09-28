module Static.View exposing (header)

import Html exposing (Html, a, div, img)
import Html.Attributes exposing (alt, class, height, href, src, width)


header : Html Never
header =
    div [ class "header" ]
        [ a [ href "/" ]
            [ img [ src "/images/logo.svg", width 280, height 140, alt "siteelm" ] []
            ]
        ]
