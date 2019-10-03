module Static.View exposing (header)

import Html exposing (Html, a, div, img)
import Html.Attributes exposing (alt, class, height, href, src, width)
import Siteelm.Html.Attributes exposing (role)


header : Html Never
header =
    div [ class "header" ]
        [ div [ class "stripe" ]
            [ a [ href "https://github.com/nikueater/siteelm" ]
                [ img [ src "/images/github.svg", width 48, height 48, alt "git hub" ] []
                ]
            ]
        , a [ href "/", role "banner" ]
            [ img [ class "logo", src "/images/logo.svg", width 320, height 160, alt "siteelm" ] []
            ]
        ]
