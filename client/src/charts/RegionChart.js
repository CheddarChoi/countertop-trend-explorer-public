import React from "react";
import Plot from "react-plotly.js";
import {} from "../utils.js";
import { usRegions, stateNameToCode } from "../data/categories.js";

const RegionChart = ({ inputRegionCategory, inputArea }) => {
  const stateCounter = [];
  const locations = [];
  const z = [];
  if (!inputRegionCategory) {
    usRegions["52개 주"].forEach((state) => {
      stateCounter[state] = 1;
    });
  } else if (inputRegionCategory) {
    if (inputRegionCategory === "5개 권역") {
      if (!inputArea) {
        let numRegions = 5;
        let regionIdx = 1;
        Object.values(usRegions["5개 권역"]).forEach((region) => {
          Object.values(region).forEach((state) => {
            stateCounter[state] = regionIdx;
          });
          regionIdx += 52 / numRegions;
        });
      } else {
        usRegions["5개 권역"][inputArea].forEach((state) => {
          stateCounter[state] = 1;
        });
      }
    } else if (inputRegionCategory === "9개 지역") {
      if (!inputArea) {
        let numRegions = 9;
        let regionIdx = 1;
        Object.values(usRegions["9개 지역"]).forEach((region) => {
          Object.values(region).forEach((state) => {
            stateCounter[state] = regionIdx;
          });
          regionIdx += 52 / numRegions;
        });
      } else {
        usRegions["9개 지역"][inputArea].forEach((state) => {
          stateCounter[state] = 1;
        });
      }
    } else if (inputRegionCategory === "52개 주") {
      if (!inputArea) {
        let regionIdx = 1;
        usRegions["52개 주"].forEach((state) => {
          stateCounter[state] = regionIdx;
          regionIdx += 1;
        });
      } else {
        usRegions["52개 주"].forEach((state) => {
          if (state === inputArea) {
            stateCounter[state] = 1;
          }
        });
      }
    }
  }
  Object.keys(stateCounter).forEach((state) => {
    if (stateCounter[state] > 0) {
      locations.push(stateNameToCode[state]);
      z.push(stateCounter[state]);
    }
  });

  const mapData = [
    {
      type: "choropleth",
      locationmode: "USA-states",
      locations: locations,
      z: z,
      text: locations.map((code) =>
        Object.keys(stateNameToCode).find(
          (key) => stateNameToCode[key] === code
        )
      ),
      colorscale: [
        [0, "#8cb369"],
        [0.2, "#f4e285"],
        [0.4, "#f4a259"],
        [0.6, "#1D9A6C"],
        [0.8, "#5b8e7d"],
        [1, "#b388eb"],
      ],
      colorbar: {
        title: "Count",
        thickness: 10,
      },
      showscale: false,
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
        margin: { t: 0, r: 0, l: 0, b: 0 },
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "400px" }}
      config={{ displayModeBar: false }}
    />
  );
};

export default RegionChart;
