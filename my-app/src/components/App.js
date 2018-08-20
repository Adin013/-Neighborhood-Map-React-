import React, {Component} from 'react';
import SearchList from './SearchList';

class App extends Component {
  
    constructor(props) {
        super(props);
        this.state = {
            'alllocations': [
              { 'title': 'Reichstag', 'lat': 52.51878011488856, 'lng': 13.376026153564453 },  
              { 'title': 'Brandenburger Tor', 'lat': 52.516116401541495, 'lng': 13.377656936645508 },     
              { 'title': 'Fernsehturm', 'lat': 52.520856132425436, 'lng': 13.409371376037598},              
              { 'title': 'Checkpoint Charlie', 'lat': 52.50762800254218, 'lng': 13.39033842086792}, 
              { 'title': 'Potsdamer Platz', 'lat': 52.50950865077948,  'lng': 13.376412391662598},
            ],           
            'map': '',
            'infowindow': '',
            'prevmarker': '',
            'subject': '',
            'requestWasSuccessful': true,
            'selectedMarker':'',
            'data':[]
            
        };

        // retain object instance when used in the function
        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    //To update the subject when the user use the search field
    updatesubject =(subject) => {
        this.setState({subject: subject})
    }

    //Update the data fater geeting the info from the API
    updateData = (newData) => {
        this.setState({
          data:newData,
        });
    }


    componentDidMount() {
        window.initMap = this.initMap;
        // load the Google Maps 
        loadMapJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyDhzz_miq8eMnhWiqUEO87isM8V8k-QT3Q&callback=initMap')
    }

    
    //Map Container
    initMap() {
        var self = this;

        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 52.50953477032727, lng: 13.376712799072266},
            zoom: 15,
            mapTypeControl: false
        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var alllocations = [];
        this.state.alllocations.forEach(function (location) {
            var longtitle = location.title + ' - ';
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.lat, location.lng),
                animation: window.google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            
            });

            location.longtitle = longtitle;
            location.marker = marker;
            location.display = true;
            alllocations.push(location);
        });
        this.setState({
            'alllocations': alllocations
        });
        this.setState({highlightedIcon: this.makeMarkerIcon('66ff66')})
    }

    
    //Used to open the infoWindow and load information
    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'prevmarker': marker
        });
        this.state.infowindow.setContent('Loading Data...');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, -200);
        this.MarkerInfo(marker);
    }

    
    //Retrive the location data from the foursquare api for the marker and display it in the infowindow
    MarkerInfo(marker, infowindow) {
        var self = this;
        const {highlightedIcon} = this.state
        var clientId = "WA3HXR3RBEZRX5WS5IZJ0QKRMQ5Q2D4CKGERWOQ4VTNSBA1Y";
        var clientSecret = "FBNKOPPIU5FYMN44YYB0DNR5DLENXCS0AO12Z1MR0D4XEPMS";
        // Build the api endpoint
      
    var url =
      "https://api.foursquare.com/v2/venues/search?client_id=" +
      clientId +
      "&client_secret=" +
      clientSecret +
      "&v=20130815&ll=" +
      marker.getPosition().lat() +
      "," +
      marker.getPosition().lng() +
      "&limit=1";
    fetch(url)
      .then(function(response) {
        if (response.status !== 200) {
          self.state.infowindow.setContent("oops error loading data");
          return;
        }

        // Get the text in the response
        response.json().then(function(data) {
          console.log(data);
          var location_data = data.response.venues[0];
          var place = `<h3>${location_data.name}</h3>`;
          var street = `<p>${location_data.location.formattedAddress[0]}</p>`;
          var contact = "";
          if (location_data.contact.phone)
            contact = `<p><small>${location_data.contact.phone}</small></p>`;

          var readMore =
            '<a href="https://foursquare.com/v/' +
            location_data.id +
            '" target="_blank">Read More on <b>Foursquare Website</b></a>';
          self.state.infowindow.setContent(
            place + street + contact + readMore
          );
        });
        marker.setIcon(highlightedIcon)
      infowindow.marker = marker;
      })
      .catch(function(err) {
        self.state.infowindow.setContent("oops error loading data. please try again in a few seconds");
      });
  }
  
    makeMarkerIcon = (markerColor) => {
      let markerImage = new window.google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new window.google.maps.Size(21, 34),
        new window.google.maps.Point(0, 0),
        new window.google.maps.Point(10, 34),
        new window.google.maps.Size(21,34));
      return markerImage;
    }
    
    //Close the infowindow for the marker
    closeInfoWindow() {
        if (this.state.prevmarker) {
            this.state.prevmarker.setAnimation(null);
        }
        this.setState({
            'prevmarker': ''
        });
        this.state.infowindow.close();
    }

    //Render function of App
    render() {
        return (

          <div>
        <h1 className="heading" style={{margin: 1, textAlign: 'center', backgroundColor: '#ccffe6'}}> Welcome to Berlin </h1>
         <div id="map" />   
            <SearchList
              key="100"
              alllocations={this.state.alllocations}
              openInfoWindow={this.openInfoWindow}
              closeInfoWindow={this.closeInfoWindow}
            />
            
          </div>
        );
    }
}

export default App;

/**
 * Load the google maps Asynchronously
 * @param {url} url of the google maps script
 */
function loadMapJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = function () {
        document.write("Google Maps can't be loaded");
    };
    ref.parentNode.insertBefore(script, ref);
}