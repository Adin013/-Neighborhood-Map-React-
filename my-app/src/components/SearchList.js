import React, {Component} from 'react';
import LocationItem from './LocationItem';

class SearchList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            'locations': '',
            'subject': '',
            'offers': true,
        };

        this.searchLocations = this.searchLocations.bind(this);
        this.toggleFamousPlaces = this.toggleFamousPlaces.bind(this);
    }

    // the locations depending on the user input
    searchLocations(event) {
        this.props.closeInfoWindow();
        const {value} = event.target;
        var locations = [];
        this.props.alllocations.forEach(function (location) {
            if (location.longtitle.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                location.marker.setVisible(true);
                locations.push(location);
            } else {
                location.marker.setVisible(false);
            }
        });

        this.setState({
            'locations': locations,
            'subject': value
        });
    }

    componentWillMount() {
        this.setState({
            'locations': this.props.alllocations
        });
    }

    //Show and hide offers
    toggleFamousPlaces() {
        this.setState({
            'offers': !this.state.offers
        });
    }

    //Render function of SearchList
    render() {
        var SearchList = this.state.locations.map(function (listItem, index) {
            return (
                <LocationItem key={index} openInfoWindow={this.props.openInfoWindow.bind(this)} data={listItem}/>
            );
        }, this);

        return (
            <div className="search">
                <input onClick={this.toggleFamousPlaces} role="search" aria-labelledby="Search" id="search-field" className="search-field" type="text" placeholder="Search"
                       value={this.state.subject} onChange={this.searchLocations} style={{width:186, }} />

                <ul>
                    {this.state.offers && SearchList}
                </ul>
               
            </div>
        );
    }
}

export default SearchList;