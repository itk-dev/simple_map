
var map = null;
var count = 0;
var regions = null;
var population = 0;

function addCommas(nStr) {
  nStr += '';
  x = nStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + '.' + '$2');
  }
  return x1 + x2;
}

// Call this function when the page has been loaded
function initialize() {
  map = new OpenLayers.Map('map', {allOverlays: true});
  var gphy = new OpenLayers.Layer.Google(
      "Google Physical",
      {type: google.maps.MapTypeId.TERRAIN}
  );
  map.addLayers([gphy]);

  // Google.v3 uses EPSG:900913 as projection, so we have to
  // transform our coordinates
  map.setCenter(new OpenLayers.LonLat(10.431763, 56.016808).transform(
      new OpenLayers.Projection("EPSG:4326"),
      map.getProjectionObject()
  ), 7);

  // Request regions and population
  $.post('index.php', {'action' : 'loadinterested'}, tingmapResponse, 'json');
  $.post('index.php', {'action' : 'loadnotinterested'}, tingmapResponse, 'json');
  $.post('index.php', {'action' : 'loadpopulation'}, populationResponse, 'json');

}

function addRegionToMap(file, color, name) {
  // Create the style
  var styleMap = new OpenLayers.StyleMap({
    "default": new OpenLayers.Style({
      fillColor: color,
      fillOpacity: 0.4,
      strokeColor: "black",
      strokeWidth: 1,
      pointRadius: 0
    }),
    "temporary": new OpenLayers.Style({
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: "black",
      strokeWidth: 1.2,
      pointRadius: 0,
      cursor: "pointer"
    })
  });

  // Load the KML file.
  var vector = new OpenLayers.Layer.Vector(name, {
      strategies: [new OpenLayers.Strategy.Fixed()],
      protocol: new OpenLayers.Protocol.HTTP({
          url: file,
          format: new OpenLayers.Format.KML({
              extractStyles: false,
              extractAttributes: false,
              maxDepth: 2
          })
      }),
      styleMap: styleMap
  })
  map.addLayers([vector]);

//  // Hover render
//  var highlightCtrl = new OpenLayers.Control.SelectFeature(vector, {
//    hover: true,
//    highlightOnly: true,
//    renderIntent: "temporary"
//  });
//  map.addControl(highlightCtrl);
//  highlightCtrl.activate();
}

function tingmapResponse(response) {
  if (response['status'] == 'loaded') {
    regions = response['regions'];
    for (var region_ID in regions) {
      var region = regions[region_ID];      
      addRegionToMap(region['file'], region['color'], region['name']);
    }
  }
  else {
    alert(response['msg']);
  }
}

function populationResponse(response) {
  if (response['status'] == 'population') {
    var data = response['population'];

    // Ting population
    var total = $('#population #pop-total');
    $('.num', total).append(addCommas(data['total']));
    
    var selected = $('#population #pop-selected')
    $('.num', selected).append(addCommas(data['selected']));
    $('.pro', selected).append(pro(data['total'], data['selected']) + '%');

    var interested = $('#population #pop-interested')
    $('.num', interested).append(addCommas(data['interested']));
    $('.pro', interested).append(pro(data['total'], data['interested']) + '%');

    var not_interested = $('#population #pop-not-interested');
    $('.num', not_interested).append(addCommas(data['not-interested']));
    $('.pro', not_interested).append(pro(data['total'], data['not-interested']) + '%');
    
  }
  else {
    alert(response['msg']);
  }
  
}

function pro(total, x) {
  var original = (x / total) * 100;
  return Math.round(original*10)/10;
}

// Load maps
$('document').ready(function () { initialize(); });
