import React, { useState } from "react";
import ImageExplorer from "../../component/ImageExplorer";

import { Box, Grid, Typography } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import {
  cabinet_color_mapping,
  cabinet_type_mapping,
  countertop_color_mapping,
  countertop_pattern_mapping,
  floor_color_mapping,
} from "../../data/categories";
import TimeBasedBarChart from "../../charts/TimeBasedBarChart";

export const surroundingElementTypes = {
  floorColorCounts: {
    name: "Floor Color",
    id: "floor_color",
    types: Object.keys(floor_color_mapping),
  },
  cabinetColorCounts: {
    name: "Cabinet Color",
    id: "cabinet_color",
    types: Object.keys(cabinet_color_mapping),
  },
  cabinetTypeCounts: {
    name: "Cabinet Type",
    id: "cabinet_type",
    types: Object.keys(cabinet_type_mapping),
  },
};

export const SurroundingElementsInput = ({
  inputType,
  setInputType,
  inputValue,
  setInputValue,
  style,
}) => {
  const [inputSubType, setInputSubType] = useState("Wood");

  return (
    <Box style={{ display: "flex", gap: "16px", width: "100%", ...style }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="input-color">Type</InputLabel>
        <Select
          labelId="input-type"
          id="input-type-select"
          value={inputType}
          label="Type"
          onChange={(e) => {
            setInputValue("");
            setInputType(e.target.value);
          }}
        >
          {Object.keys(surroundingElementTypes).map((type) => (
            <MenuItem key={type} value={type}>
              {surroundingElementTypes[type].name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {inputType === "floorColorCounts" && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="input-subtype">SubType</InputLabel>
          <Select
            labelId="input-subtype"
            id="input-subtype-select"
            value={inputSubType}
            label="SubType"
            onChange={(e) => setInputSubType(e.target.value)}
          >
            <MenuItem key="Wood" value="Wood">
              Wood
            </MenuItem>
            <MenuItem key="Stone" value="Stone">
              Stone
            </MenuItem>
          </Select>
        </FormControl>
      )}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="input-pattern">Input</InputLabel>
        <Select
          labelId="input-pattern"
          id="input-pattern-select"
          value={inputValue}
          label="pattern"
          onChange={(e) => setInputValue(e.target.value)}
        >
          {inputType === "floorColorCounts" &&
            surroundingElementTypes[inputType].types
              .filter((pattern) => pattern.includes(inputSubType))
              .map((pattern) => (
                <MenuItem key={pattern} value={pattern}>
                  {pattern}
                </MenuItem>
              ))}
          {(inputType === "cabinetColorCounts" || inputType === "cabinetTypeCounts") &&
            surroundingElementTypes[inputType].types.map((pattern) => (
              <MenuItem key={pattern} value={pattern}>
                {pattern}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
};

const SurroundingElementsBased = () => {
  const [inputType, setInputType] = useState("");
  const [inputValue, setInputValue] = useState("");

  return (
    <div>
      <Typography variant="h4">주변요소별 트렌드</Typography>
      <div
        style={{
          marginTop: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Typography variant="h5">Trend of</Typography>
          <SurroundingElementsInput
            inputType={inputType}
            setInputType={setInputType}
            inputValue={inputValue}
            setInputValue={setInputValue}
          />
        </div>
      </div>
      <Grid container spacing={2} sx={{ marginTop: "32px" }}>
        <Grid item xs={12} lg={6}>
          <div className="chartContainer">
            <Typography variant="h6">표면소재 컬러 트렌드</Typography>
            <TimeBasedBarChart
              dataSource="colorCounts"
              elementMapping={countertop_color_mapping}
              filterType={inputType}
              filterValue={inputValue}
            />
          </div>
        </Grid>
        <Grid item xs={12} lg={6}>
          <div className="chartContainer">
            <Typography variant="h6">표면소재 패턴 트렌드</Typography>
            <TimeBasedBarChart
              dataSource="patternCounts"
              elementMapping={countertop_pattern_mapping}
              filterType={inputType}
              filterValue={inputValue}
            />
          </div>
        </Grid>
        <Grid item xs={12} lg={12}>
          <ImageExplorer
            surroundingInputType={inputType === "" ? "" : surroundingElementTypes[inputType].id}
            surroundingInputValue={inputValue}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default SurroundingElementsBased;
