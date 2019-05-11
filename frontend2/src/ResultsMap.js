import React, { Component } from 'react';
import {Map, GoogleApiWrapper, Polygon} from 'google-maps-react';
import Borders from './StateBorders.js';

export class MapContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            guess: this.props.guess,
            polygons: []
        }
        this.adjustedGuess = this.adjustedGuess.bind(this);
    }


    adjustedGuess(guess) {
        let max = 0;
        Object.keys(guess).forEach(function(key){
            max = Math.max(max, guess[key]);
        });
        let adjusted = {};
        Object.keys(guess).forEach(function(key){
            adjusted[key] = guess[key] / max;
        });
        return adjusted;
    }

    render() {
        let polygons = [];

        let adjusted = this.adjustedGuess(this.props.guess);
        Object.keys(Borders).forEach(function(key){
            let weight = adjusted[key];
            let coords = Borders[key].Coordinates;
            let color = 100 - Math.round(weight * 100);
            let colorStr = 'hsl(' + color + ', 100%, 50%)';
            polygons.push(
                <Polygon
                    key={key}
                    paths={coords}
                    strokeColor="#fff"
                    strokeOpacity={0.8}
                    strokeWeight={0}
                    fillColor={colorStr}
                    fillOpacity={0.5}
                    onClick={() => {
                        // curious about state "key"
                    }}
                />
            )
        });

        let mapStyles = [
            {
                "featureType": "all",
                "elementType": "labels.text",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            }
        ]

        const defaultMapOptions = {
          styles: mapStyles
        };

        return(
            <div
                style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                }}
            >
                <Map
                    google={this.props.google}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'fixed',
                    }}
                    className={'map'}
                    zoom={3}
                    defaultOptions={defaultMapOptions}
                >
                    {polygons}
            </Map>
            </div>
        )
    }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyAVQ-sy1G7aUQWxuTZjNsW0I6IBzcNocmQ'
})(MapContainer)
