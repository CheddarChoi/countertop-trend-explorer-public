import React from "react";
import { Typography, Grid } from "@mui/material";
import TimeBasedBarChart from "../../charts/TimeBasedBarChart";
import {
  cabinet_color_mapping,
  cabinet_type_mapping,
  countertop_color_mapping,
  countertop_pattern_mapping,
  floor_color_mapping,
} from "../../data/categories";

const TimeBased = () => {
  const charts = [
    {
      title: "표면소재 컬러 트렌드",
      dataSource: "colorCounts",
      mapping: countertop_color_mapping,
    },
    {
      title: "표면소재 패턴 트렌드",
      dataSource: "patternCounts",
      mapping: countertop_pattern_mapping,
    },
    {
      title: "캐비넷 색상 트렌드",
      dataSource: "cabinetColorCounts",
      mapping: cabinet_color_mapping,
    },
    {
      title: "캐비넷 유형 트렌드",
      dataSource: "cabinetTypeCounts",
      mapping: cabinet_type_mapping,
    },
    {
      title: "바닥 색상 트렌드",
      dataSource: "floorColorCounts",
      mapping: floor_color_mapping,
    },
  ];

  return (
    <div>
      <Typography variant="h4">표면소재 트렌드 변화 추이</Typography>
      <Grid container spacing={2} sx={{ marginTop: "32px" }}>
        {charts.map((chart, index) => (
          <Grid key={index} item xs={12} lg={6}>
            <div className="chartContainer">
              <Typography variant="h6">{chart.title}</Typography>
              <TimeBasedBarChart dataSource={chart.dataSource} elementMapping={chart.mapping} />
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default TimeBased;
