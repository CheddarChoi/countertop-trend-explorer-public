import Plot from "react-plotly.js";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { processData } from "../utils";

const TrendLineChart = ({ inputColor, inputPattern }) => {
  const [rawData, setRawData] = useState({ main: {}, sub: {}, docCount: 0 });
  const [yearData, setYearData] = useState({});
  const [traces, setTraces] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const summaryDocRef = doc(db, "summaries", "partialColorPatternCounts");
      const summaryDocSnap = await getDoc(summaryDocRef);

      if (summaryDocSnap.exists()) {
        setRawData(summaryDocSnap.data());
      } else {
        console.log("Summary data does not exist");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData2 = async () => {
      const summaryDocRef = doc(db, "summaries", "yearlyCounts");
      const summaryDocSnap = await getDoc(summaryDocRef);

      if (summaryDocSnap.exists()) {
        setYearData(summaryDocSnap.data()["partial"]);
      } else {
        console.log("Summary data does not exist");
      }
    };

    fetchData2();
  }, []);

  useEffect(() => {
    if (!rawData.main || !rawData.sub || !yearData.main || !yearData.sub) {
      return;
    }

    const mainData = processData(rawData.main, inputColor, inputPattern);
    const subData = processData(rawData.sub, inputColor, inputPattern);

    for (const year in mainData) {
      mainData[year] /= yearData["main"][year];
    }
    for (const year in subData) {
      subData[year] /= yearData["sub"][year];
    }

    const traces = [
      {
        x: Object.keys(mainData),
        y: Object.values(mainData),
        type: "scatter",
        name: "Main Countertop",
      },
      {
        x: Object.keys(subData),
        y: Object.values(subData),
        type: "scatter",
        name: "Sub Countertop",
      },
    ];
    setTraces(traces);
  }, [rawData, yearData, inputColor, inputPattern]);

  return (
    <Plot
      data={traces}
      layout={{
        barmode: "stack",
        autosize: true,
        margin: { t: 10, r: 0, l: 20, b: 10 },
        legend: { orientation: "h", x: 0.5, y: -0.1, xanchor: "center" },
        yaxis: { hoverformat: ".3f", range: [0, 1] },
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "300px" }}
      config={{ displayModeBar: false }}
    />
  );
};

export default TrendLineChart;
