import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { processData } from "../utils";

import {
  cabinet_color_mapping,
  cabinet_type_mapping,
  floor_color_mapping,
} from "../data/categories.js";

const SurroundingsBarChart = ({ inputColor, inputPattern }) => {
  const [rawData, setRawData] = useState({ cabinetColorCounts: {}, cabinetTypeCounts: {}, docCount: 0, floorColorCounts: {} });

  useEffect(() => {
    const fetchData = async () => {
      const summaryDocRef = doc(db, "summaries", "colorPatternSurroundingCounts");
      const summaryDocSnap = await getDoc(summaryDocRef);

      if (summaryDocSnap.exists()) {
        setRawData(summaryDocSnap.data());
      } else {
        console.log("Summary data does not exist");
      }
    };

    fetchData(); 
  }, []);


  const calculateFullLength = (data) => {
    let cnt = 0;

    for (const label in data) {
      cnt += data[label];
    }

    return cnt;
  }

  const cabinetColorDataAll = processData(rawData.cabinetColorCounts, false, false);
  const cabinetTypeDataAll = processData(rawData.cabinetTypeCounts, false, false);
  const floorColorDataAll = processData(rawData.floorColorCounts, false, false);

  const cabinetColorData = processData(rawData.cabinetColorCounts, inputColor, inputPattern);
  const cabinetTypeData = processData(rawData.cabinetTypeCounts, inputColor, inputPattern);
  const floorColorData = processData(rawData.floorColorCounts, inputColor, inputPattern);

  const plots = [];

  const categories = ["floor_color", "cabinet_color", "cabinet_type"];

  categories.forEach((category) => {
    const elementMapping =
      category === "floor_color"
        ? floor_color_mapping
        : category === "cabinet_color"
        ? cabinet_color_mapping
        : cabinet_type_mapping;

    const allCategoryData = 
        category === "floor_color"
        ? floorColorDataAll
        : category === "cabinet_color"
        ? cabinetColorDataAll
        : cabinetTypeDataAll;
      
    const filteredCategoryData = 
        category === "floor_color"
        ? floorColorData
        : category === "cabinet_color"
        ? cabinetColorData
        : cabinetTypeData;

    const fullDataLength = 
        category === "floor_color"
        ? calculateFullLength(floorColorDataAll)
        : category === "cabinet_color"
        ? calculateFullLength(cabinetColorDataAll)
        : calculateFullLength(cabinetTypeDataAll);

    const fullfilteredDataLength = 
        category === "floor_color"
        ? calculateFullLength(floorColorData)
        : category === "cabinet_color"
        ? calculateFullLength(cabinetColorData)
        : calculateFullLength(cabinetTypeData);

    const traces = Object.keys(elementMapping).map((label) => ({
      x: ["All", "Input"],
      y: [
        allCategoryData[label] / fullDataLength,
        filteredCategoryData[label] / fullfilteredDataLength,
      ],
      name: label,
      type: "bar",
      marker:
        typeof elementMapping[label] === "object"
          ? {
              pattern: {
                shape: elementMapping[label].shape,
                size: 5,
                fillmode: "overlay",
                bgcolor: elementMapping[label].bgcolor,
                fgcolor: elementMapping[label].color,
              },
            }
          : { color: elementMapping[label], opacity: [0.7, 1] },
    }));

    plots.push(
      <Plot
        key={category}
        data={traces}
        layout={{
          barmode: "stack",
          margin: { t: 30, r: 0, l: 0, b: 50 },
          autosize: true,
          showlegend: false,
          legend: { orientation: "h" },
          xaxis: {
            hoverformat: ".1f",
          },
          yaxis: {
            tickformat: "%",
            hoverformat: ".1f",
            range: [0, 1],
          },
          annotations: [
            {
              text: category.replace("_", " ").toUpperCase(),
              showarrow: false,
              xref: "paper",
              yref: "paper",
              x: 0.5,
              y: -0.1,
              xanchor: "center",
              yanchor: "top",
              font: {
                size: 14,
                color: "black",
              },
            },
          ],
        }}
        useResizeHandler={true}
        style={{ width: "30%", height: "300px" }}
        config={{ displayModeBar: false }}
      />
    );
  });

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignContent: "start" }}>
      {plots}
    </div>
  );
};

export default SurroundingsBarChart;
