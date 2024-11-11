years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]

countertop_pattern = [
  "Calacatta",
  "Concrete",
  "Granular",
  "LargeMovement",
  "LongVein",
  "Quartzite",
  "ShortVein",
  "Solid",
  "Wave",
]

countertop_pattern_mapping = {
  "Concrete": "#737372",
  "Solid": "#DBD8D3",
  "Calacatta": { "type": "pattern", "shape": "/", "color": "#89888C", "bgcolor": "#F2EBDF" },
  "Granular": { "type": "pattern", "shape": "x", "color": "#654321", "bgcolor": "#D2B48C" },
  "LargeMovement": { "type": "pattern", "shape": "-", "color": "#212026", "bgcolor": "#F2F2F0" },
  "LongVein": { "type": "pattern", "shape": "|", "color": "#212026", "bgcolor": "#D7D7D9" },
  "Quartzite": { "type": "pattern", "shape": "+", "color": "#212026", "bgcolor": "#A69580" },
  "ShortVein": { "type": "pattern", "shape": ".", "color": "#03738C", "bgcolor": "#F2F2F0" },
  "Wave": { "type": "pattern", "shape": "/", "color": "#03738C", "bgcolor": "#D9BD9C" },
}

countertop_color_mapping = {
  "White": "#F2EDEB",
  "Beige": "#F2D9BB",
  "Brown": "#A69580",
  "Dark Brown": "#59402A",
  "Gray": "#D7D7D9",
  "Dark Gray": "#89888C",
  "Etc": "#03738C",
  "Black": "#212026",
}

cabinet_color_mapping = {
  "White": "#F2F2F0",
  "Beige": "#DED6CB",
  "Light Brown": "#D2B48C",
  "Medium Brown": "#A52A2A",
  "Dark Brown": "#654321",
  "Red": "#7E4242",
  "Light Gray": "#DBD8D3",
  "Dark Gray": "#5D5C5A",
  "Green": "#52584E",
  "Black": "#2E2E30",
}

cabinet_type_mapping = {
  "Flat Panel": "#F5F5DC",
  "Non-Flat Panel": "#D3D3D3",
}

floor_color_mapping = {
  "Stone_White": "#F2F2F0",
  "Wood_White": "#F2F2F0",

  "Stone_Beige": "#D9D6D0",
  "Wood_Beige": "#D9D6D0",

  "Stone_Light Brown": "#D9BD9C",
  "Wood_Light Brown": "#D9BD9C",

  "Stone_Medium Brown": "#A67E5B",
  "Wood_Medium Brown": "#A67E5B",
  "Wood_Dark Brown": "#59442A",

  "Stone_Light Gray": "#BFBFBF",
  "Wood_Light Gray": "#BFBFBF",

  "Stone_Medium Gray": "#A5A6A4",
  "Wood_Medium Gray": "#A5A6A4",

  "Stone_Dark Gray": "#737372",
  "Wood_Dark Gray": "#737372",

  "Stone_Black": "#000000",
  "Wood_Black": "#000000",
}

stateNameToCode = {
  "Delaware": "DE",
  "Pennsylvania": "PA",
  "New Jersey": "NJ",
  "Georgia": "GA",
  "Connecticut": "CT",
  "Massachusetts": "MA",
  "Maryland": "MD",
  "South Carolina": "SC",
  "New Hampshire": "NH",
  "Virginia": "VA",
  "New York": "NY",
  "North Carolina": "NC",
  "Rhode Island": "RI",
  "Vermont": "VT",
  "Kentucky": "KY",
  "Tennessee": "TN",
  "Ohio": "OH",
  "Louisiana": "LA",
  "Indiana": "IN",
  "Mississippi": "MS",
  "Illinois": "IL",
  "Alabama": "AL",
  "Maine": "ME",
  "Missouri": "MO",
  "Arkansas": "AR",
  "Michigan": "MI",
  "Florida": "FL",
  "Texas": "TX",
  "Iowa": "IA",
  "Wisconsin": "WI",
  "California": "CA",
  "Minnesota": "MN",
  "Oregon": "OR",
  "Kansas": "KS",
  "West Virginia": "WV",
  "Nevada": "NV",
  "Nebraska": "NE",
  "Colorado": "CO",
  "North Dakota": "ND",
  "South Dakota": "SD",
  "Montana": "MT",
  "Washington": "WA",
  "Idaho": "ID",
  "Wyoming": "WY",
  "Utah": "UT",
  "Oklahoma": "OK",
  "New Mexico": "NM",
  "Arizona": "AZ",
  "Alaska": "AK",
  "Hawaii": "HI",
}

regionCategory = ["5개 권역", "9개 지역", "52개 주"]
usRegions = {
  "9개 지역": {
    "New England": [
      "Maine",
      "New Hampshire",
      "Vermont",
      "Massachusetts",
      "Rhode Island",
      "Connecticut",
    ],
    "Mid-Atlantic": [
      "New York",
      "Pennsylvania",
      "New Jersey",
      "Delaware",
      "Maryland",
      "Virginia",
      "West Virginia",
      "Washington D.C.",
    ],
    "Southeast": [
      "North Carolina",
      "South Carolina",
      "Georgia",
      "Florida",
      "Alabama",
      "Mississippi",
      "Tennessee",
      "Kentucky",
      "Louisiana",
      "Arkansas",
    ],
    "Great Lakes": ["Michigan", "Ohio", "Indiana", "Illinois", "Wisconsin", "Minnesota"],
    "Central": ["Missouri", "Iowa", "North Dakota", "South Dakota", "Nebraska", "Kansas"],
    "Southwest": ["New Mexico", "Texas", "Oklahoma", "Arizona"],
    "Rocky Mountains": ["Montana", "Idaho", "Wyoming", "Utah", "Colorado", "Nevada"],
    "Pacific Northwest": ["Washington", "Oregon", "Alaska"],
    "Pacific Southwest": ["California", "Hawaii", "Nevada"],
  },
  "5개 권역": {
    "New England": [
      "Maine",
      "New Hampshire",
      "Vermont",
      "Massachusetts",
      "Rhode Island",
      "Connecticut",
    ],
    "Mid-Atlantic": [
      "New York",
      "Pennsylvania",
      "New Jersey",
      "Delaware",
      "Maryland",
      "Virginia",
      "West Virginia",
      "Washington D.C.",
    ],
    "South": [
      "North Carolina",
      "South Carolina",
      "Georgia",
      "Florida",
      "Alabama",
      "Mississippi",
      "Tennessee",
      "Kentucky",
      "Louisiana",
      "Arkansas",
      "Texas",
      "Oklahoma",
    ],
    "Midwest": [
      "Michigan",
      "Ohio",
      "Indiana",
      "Illinois",
      "Wisconsin",
      "Minnesota",
      "Missouri",
      "Iowa",
      "North Dakota",
      "South Dakota",
      "Nebraska",
      "Kansas",
    ],
    "West": [
      "New Mexico",
      "Arizona",
      "Utah",
      "Colorado",
      "Montana",
      "Idaho",
      "Washington",
      "Oregon",
      "California",
      "Nevada",
      "Alaska",
      "Hawaii",
      "Wyoming",
    ],
  },
  "52개 주": [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
    "Washington D.C.",
    "Puerto Rico",
  ],
}