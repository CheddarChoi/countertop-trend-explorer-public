import React from "react";
import { Grid, Typography } from "@mui/material";

import TrendLineChart from "../charts/TrendLineChart";
import SurroundingsBarChart from "../charts/SurroundingsBarChart";
import MapChart from "../charts/MapChart";
import ImageExplorer from "../component/ImageExplorer";

const ColorPatternDashboard = ({ inputColor, inputPattern }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={6}>
        <div className="chartContainer">
          <Typography variant="h6">트렌드 추이</Typography>
          <TrendLineChart inputColor={inputColor} inputPattern={inputPattern} />
        </div>
      </Grid>
      <Grid item xs={12} lg={6}>
        <div className="chartContainer">
          <Typography variant="h6">주변요소 트렌드</Typography>
          <SurroundingsBarChart inputColor={inputColor} inputPattern={inputPattern} />
        </div>
      </Grid>
      <Grid item xs={12} lg={12}>
        <ImageExplorer inputColor={inputColor} inputPattern={inputPattern} inputType="countertop" />
      </Grid>
      <Grid item xs={12} lg={7}>
        <div className="chartContainer">
          <Typography variant="h6">지역 별 사용 빈도</Typography>
          <MapChart inputColor={inputColor} inputPattern={inputPattern} proportion={false} />
        </div>
      </Grid>
      <Grid item xs={12} lg={7}>
        <div className="chartContainer">
          <Typography variant="h6">지역 별 사용 비율</Typography>
          <MapChart inputColor={inputColor} inputPattern={inputPattern} proportion={true} />
        </div>
      </Grid>
    </Grid>
  );
};

export default ColorPatternDashboard;
