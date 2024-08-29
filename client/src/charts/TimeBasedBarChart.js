import React, { useEffect } from "react";
import Plot from "react-plotly.js";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { years } from "../data/categories";

const TimeBasedBarChart = ({ dataSource, elementMapping, filterType, filterValue }) => {
  const [data, setData] = React.useState({});
  const [traces, setTraces] = React.useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const summaryDocRef = doc(db, "summaries", "yearlyCounts");
      const summaryDocSnap = await getDoc(summaryDocRef);
      if (summaryDocSnap.exists()) {
        setData(summaryDocSnap.data()[dataSource]);
      } else {
        console.log("Summary data does not exist");
      }
    };

    const fetchSurroundingData = async (collectionName, filterType, filterValue) => {
      const summaryDocRef = doc(db, "summaries", collectionName);
      const summaryDocSnap = await getDoc(summaryDocRef);
      if (summaryDocSnap.exists()) {
        setData(summaryDocSnap.data()[filterType][filterValue]);
      } else {
        console.log("Summary data does not exist");
      }
    };

    if (filterType && filterValue && filterType !== "" && filterValue !== "") {
      if (dataSource === "colorCounts") {
        fetchSurroundingData("surroundingColorCounts", filterType, filterValue);
      } else if (dataSource === "patternCounts") {
        fetchSurroundingData("surroundingPatternCounts", filterType, filterValue);
      }
    } else {
      fetchData();
    }
  }, [dataSource, elementMapping, filterType, filterValue]);

  useEffect(() => {
    const traces = Object.keys(elementMapping).map((category) => {
      const totalCountsPerYear = years.map((year) =>
        Object.keys(data).reduce((acc, key) => acc + (data[key][year] || 0), 0)
      );

      return {
        x: years,
        y: data[category]
          ? years.map((year) => data[category][year] || 0)
          : Array(years.length).fill(0),
        type: "bar",
        name: category,
        marker:
          typeof elementMapping[category] === "object"
            ? {
                pattern: {
                  shape: elementMapping[category].shape,
                  size: 5,
                  fillmode: "overlay",
                  bgcolor: elementMapping[category].bgcolor,
                  fgcolor: elementMapping[category].color,
                },
              }
            : { color: elementMapping[category] },
        hovertemplate: category + " (%{x})<br>%{y} / %{customdata:.2f}%<extra></extra>",
        customdata: data[category]
          ? years.map((year, idx) => ((data[category][year] || 0) / totalCountsPerYear[idx]) * 100)
          : Array(years.length).fill(0),
      };
    });
    setTraces(traces);
  }, [data, elementMapping]);

  return (
    <Plot
      data={traces}
      layout={{
        barmode: "stack",
        autosize: true,
        margin: { t: 20, r: 0, l: 30, b: 20 },
        showlegend: true,
        legend: {
          orientation: "h",
          x: 0.5,
          y: -0.2,
          xanchor: "center",
          font: { size: 10 },
        },
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "400px" }}
      config={{ displayModeBar: false }}
    />
  );
};

export default TimeBasedBarChart;
