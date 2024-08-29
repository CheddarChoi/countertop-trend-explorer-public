import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { stateNameToCode } from "../data/categories.js";


const MapChart = ({ inputColor, inputPattern, proportion = false }) => {
  const [rawData, setRawData] = useState({});

  const processData = (data, color, pattern) => {
    const filteredData = {};
  
    for (const state in data) {
      for (const colorKey in data[state]) {
        if (!color || colorKey === color) {
          for (const patternKey in data[state][colorKey]) {
            if (!pattern || patternKey === pattern) {
              if (!filteredData[state]) {
                filteredData[state] = 0;
              }
              filteredData[state] += data[state][colorKey][patternKey];
            }
          }
        }
      }
    }
  
    return filteredData;
  };

  useEffect(() => {
    const fetchData = async () => {
      const summaryDocRef = doc(db, "summaries", "areaColorPatternCounts");
      const summaryDocSnap = await getDoc(summaryDocRef);

      if (summaryDocSnap.exists()) {
        setRawData(summaryDocSnap.data());
      } else {
        console.log("Summary data does not exist");
      }
    };

    fetchData(); 
  }, []);

  const stateCount = processData(rawData, false, false);
  const filteredData = processData(rawData, inputColor, inputPattern);

  const allStates = Object.keys(stateNameToCode);

  const locations = [];
  const z = [];

  allStates.forEach((state) => {
    locations.push(stateNameToCode[state]);
    if (proportion) {
      z.push(filteredData[state] / stateCount[state]);
    } else {
      z.push(filteredData[state] || 0);
    }
  });

  const mapData = [
    {
      type: "choropleth",
      name: "",
      locationmode: "USA-states",
      locations: locations,
      z: z,
      text: locations.map((code) =>
        Object.keys(stateNameToCode).find((key) => stateNameToCode[key] === code)
      ),
      colorscale: [
        [0, "#DEEDCF"],
        [0.2, "#99D492"],
        [0.4, "#56B870"],
        [0.6, "#1D9A6C"],
        [0.8, "#137177"],
        [1, "#0A2F51"],
      ],
      colorbar: {
        title: "Count",
        thickness: 10,
      },
      showscale: true,
      hovertemplate: proportion ? "<b>%{text}</b>: %{z:.2f}" : "<b>%{text}</b>: %{z}",
    },
  ];

  return (
    <Plot
      data={mapData}
      layout={{
        geo: {
          scope: "usa",
          projection: {
            type: "albers usa",
          },
          showlakes: false,
          lakecolor: "rgb(255, 255, 255)",
        },
        showlegend: false,
        autosize: true,
        margin: { t: 10, r: 0, l: 0, b: 0 },
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "300px" }}
      config={{ displayModeBar: false }}
    />
  );
};

export default MapChart;
