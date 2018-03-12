var map = null
var marker = null
var markers = []
var placeTypes = [
  'accounting', 'airport', 'amusement_park', 'aquarium', 'art_gallery', 'atm', 'bakery', 'bank', 'bar', 'beauty_salon', 'bicycle_store', 'book_store', 'bowling_alley', 'bus_station', 'cafe',
  'campground', 'car_dealer', 'car_rental', 'car_repair', 'car_wash', 'casino', 'cemetery', 'church', 'city_hall', 'clothing_store', 'convenience_store', 'courthouse', 'dentist', 'department_store', 'doctor',
  'electrician', 'electronics_store', 'embassy', 'fire_station', 'florist', 'funeral_home', 'furniture_store', 'gas_station', 'gym', 'hair_care', 'hardware_store', 'hindu_temple', 'home_goods_store', 'hospital', 'insurance_agency', 'jewelry_store', 'laundry', 'lawyer', 'library', 'liquor_store', 'local_government_office', 'locksmith', 'lodging', 'meal_delivery', 'meal_takeaway', 'mosque', 'movie_rental', 'movie_theater', 'moving_company',
  'museum', 'night_club', 'painter', 'park', 'parking', 'pet_store', 'pharmacy', 'physiotherapist', 'plumber', 'police', 'post_office', 'real_estate_agency', 'restaurant', 'roofing_contractor', 'rv_park','school',
  'shoe_store', 'shopping_mall', 'spa', 'stadium', 'storage', 'store', 'subway_station', 'synagogue', 'taxi_stand', 'train_station', 'transit_station', 'travel_agency', 'university', 'veterinary_care', 'zoo'
]
var selectedTypes = []
$('#radius').val('500')

function OpenFile(event) {
  var input = event.target
  Papa.parse(input.files[0], {
    complete: function (places) {
        places.data.forEach(place => {
        if (place[4] && place[4].indexOf('ต.') > -1) {
          var location = place[4].substring(place[4].indexOf('ต.'), place[4].length)
          var url = 'api/place/queryautocomplete/json?key=AIzaSyBwBWudNWBDQoW1oeAMpiFZvAYfATEUbcA&input=' + location
          $.ajax({
            crossOrigin: true,
            crossDomain: true,
            url: url,
            success: function(data) {
              console.log(data)
            }
          })
        }
      })
    }
  })
  $('#show-places-input').css('display', 'block')
}

function CreateMarker(icon, draggable, position) {
  var marker = new google.maps.Marker({
    position: position,
    icon: icon,
    map: map,
    draggable: draggable
  })
  return marker
}

function CreateInfoWindow(marker, location) {
  var infowindow = new google.maps.InfoWindow({content: location.name + '<br>ระยะห่าง ' + marker.distance + ' เมตร'})
  marker.addListener('click', function() {
    if (marker.click) {
      infowindow.close()
    } else {
      infowindow.open(map, marker)
    }
    marker.click = !marker.click
  })
}

function SearchNearby() {
  ClearMarkers()
  var radius = $('#radius').val()
  var request = {
    location: map.center,
    rankBy: google.maps.places.RankBy.DISTANCE,
    types: selectedTypes
  }
  service = new google.maps.places.PlacesService(map)
  var originMarker = marker
  service.nearbySearch(request, function(results, status) {
    $('#places').empty()
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      console.log(results)
      results.forEach(place => {
        var icon = {
          url: place.icon,
          scaledSize: new google.maps.Size(25, 25)
        }
        var marker = CreateMarker(icon, false, place.geometry.location)
        marker.place = place
        marker.click = false
        marker.distance = google.maps.geometry.spherical.computeDistanceBetween(originMarker.position, place.geometry.location)
        CreateInfoWindow(marker, place)
        markers.push(marker)
        $('#places').append('<li class="m-b-15" id="' + place.id + '">' + place.name + '<br>ระยะห่าง: ' + marker.distance + ' เมตร<br>ประเภท: [' + place.types + ']</li>')
      })
    }
  })
}

function SelectingTypes() {
  selectedTypes = []
  placeTypes.forEach(type => {
    if ($('#' + type).is(":checked")) {
      selectedTypes.push(type)
    }
  })
  console.log(selectedTypes)
}

function ClearMarkers() {
  markers.forEach(marker => {
    marker.setMap(null)
  })
  markers = []
}

function ChangeFormInput() {
  marker.setPosition({lat: parseFloat($('#lat').val()), lng: parseFloat($('#lng').val())})
  MarkerDragend()
}

function MarkerDragend() {
  map.setCenter(marker.position)
  UpdateLatLng()
}

function UpdateLatLng() {
  $('#lat').val(marker.position.lat())
  $('#lng').val(marker.position.lng())
  SearchNearby()
}

function initMap() {
  if (navigator.geolocation) {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 13.7468152, lng: 100.5328803},
      zoom: 17
    })
    marker = CreateMarker(null, true, map.center)
    marker.addListener('dragend', MarkerDragend)
    UpdateLatLng()
    var input = (document.getElementById('place-search'))
    var placeSearch = new google.maps.places.Autocomplete(input)
    placeSearch.bindTo('bounds', map)
    google.maps.event.addListener(placeSearch, 'place_changed', function() {
      var place = placeSearch.getPlace()
      if (!place.geometry) {
        return
      }
      marker.setPosition(place.geometry.location)
      MarkerDragend()
    })
  }
  placeTypes.forEach(type => {
    $('#types').append('<div><input type="checkbox" id="' + type + '" onclick="SelectingTypes()" name="types" value="' + type + '"> ' + type + '</div>')
  })
}
