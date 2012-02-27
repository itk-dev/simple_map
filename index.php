<?php

// Load configuration
include_once dirname(__FILE__).'/utils/conf.php.inc';
global $conf;

// Load classes
include_once dirname(__FILE__).'/database/regions.php.inc';
include_once dirname(__FILE__).'/utils/layout.php.inc';
include_once dirname(__FILE__).'/utils/utils.php.inc';

function placeholder($conf) {
  $layout = new Layout(LAYOUT_FRONT);
  echo $layout;
}

// Encode regions information
function encodeRegions($type) {
  global $conf;

  // Load regions from database
  $regions = new Regions();
  $current_regions = null;
  switch ($type) {
    case REGION_INTERESTED:
      $current_regions = $regions->getAllInterestedRegions();
      break;

    case REGION_NOT_INTERESTED:
      $current_regions = $regions->getAllNotInterestedRegions();
      break;
    
  }

  // Load regions polygons and encode them
  foreach ($current_regions as $key => $region) {
    $data[$key] = array('name' => $region['name'],
            'color' => $region['color'],
            'population' => $region['population'],
            'file' => $conf->getKmlPath() . $region[file]);
  }

  return $data;
}

// Take action
try {$action = strtolower(Utils::getParam('action'));} catch (Exception $e) {};
switch ($action) {
  
  case 'loadinterested':
    echo json_encode(array('status' => "loaded", 'regions' => encodeRegions(REGION_INTERESTED)));
    break;

  case 'loadnotinterested':
    echo json_encode(array('status' => "loaded", 'regions' => encodeRegions(REGION_NOT_INTERESTED)));
    break;

  case 'loadpopulation':
    $regions = new Regions();
    echo json_encode(array('status' => "population", 'population' => $regions->getPopulation()));
    break;

  case 'embedded':
    $layout = new Layout(LAYOUT_EMBEDDED);
    echo $layout;
    break;

  default:
    echo placeholder($conf);
    break;
}

?>