export const DRIVING_OFFENSES = [
  { id: 'tailgating',       label: 'Tailgating',           icon: '🚗💨' },
  { id: 'speeding',         label: 'Speeding',             icon: '💨'   },
  { id: 'ran_red',          label: 'Ran Red Light',        icon: '🔴'   },
  { id: 'ran_stop',         label: 'Ran Stop Sign',        icon: '🛑'   },
  { id: 'reckless_lane',    label: 'Reckless Lane Change', icon: '↔️'   },
  { id: 'phone',            label: 'Phone / Distracted',   icon: '📱'   },
  { id: 'aggressive',       label: 'Aggressive Driving',   icon: '😡'   },
  { id: 'no_yield',         label: 'Failed to Yield',      icon: '⚠️'   },
  { id: 'illegal_uturn',    label: 'Illegal U-Turn',       icon: '↩️'   },
  { id: 'road_rage',        label: 'Road Rage',            icon: '🤬'   },
  { id: 'drunk',            label: 'Impaired Driving',     icon: '🍺'   },
  { id: 'cutting_off',      label: 'Cutting Off',          icon: '✂️'   },
];

export const PARKING_OFFENSES = [
  { id: 'fire_hydrant',     label: 'Blocking Hydrant',     icon: '🚒'   },
  { id: 'driveway',         label: 'Blocking Driveway',    icon: '🚪'   },
  { id: 'handicap',         label: 'Handicap (No Permit)', icon: '♿'   },
  { id: 'double_parked',    label: 'Double Parked',        icon: '🚗🚗'  },
  { id: 'crosswalk',        label: 'Blocking Crosswalk',   icon: '🚶'   },
  { id: 'no_parking_zone',  label: 'No Parking Zone',      icon: '🚫'   },
  { id: 'intersection',     label: 'Blocking Intersection',icon: '⛔'   },
  { id: 'street_cleaning',  label: 'Street Cleaning Day',  icon: '🧹'   },
  { id: 'wrong_direction',  label: 'Wrong Direction',      icon: '🔄'   },
  { id: 'multiple_spots',   label: 'Taking 2+ Spots',      icon: '😤'   },
  { id: 'bike_lane',        label: 'Blocking Bike Lane',   icon: '🚲'   },
  { id: 'sidewalk',         label: 'Parked on Sidewalk',   icon: '🚧'   },
];

// Legacy export so existing imports keep working
export const OFFENSES = [...DRIVING_OFFENSES, ...PARKING_OFFENSES];
