module Dynamic.Counter exposing (main)

import Browser
import Html exposing (Html, button, div, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)


type alias Model =
    { value : Int
    }


type Msg
    = Inc
    | Dec


main : Program Model Model Msg
main =
    Browser.element
        { init = \flags -> ( flags, Cmd.none )
        , update = update
        , view = view
        , subscriptions = always Sub.none
        }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Inc ->
            ( { model | value = model.value + 1 }, Cmd.none )

        Dec ->
            ( { model | value = model.value - 1 }, Cmd.none )


view : Model -> Html Msg
view model =
    div [ class "counter" ]
        [ button [ onClick Dec ] [ text "-1" ]
        , div [ class "value" ] [ text <| String.fromInt model.value ]
        , button [ onClick Inc ] [ text "+1" ]
        ]
