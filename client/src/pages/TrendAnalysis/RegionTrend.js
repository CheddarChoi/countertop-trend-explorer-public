import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

import RegionChart from "../../charts/RegionChart";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

import { usRegions, regionCategory } from "../../data/categories";

export const RegionInput = ({
  inputRegionCategory,
  setInputRegionCategory,
  inputArea,
  setInputArea,
  style,
}) => {
  const [patterns, setPatterns] = useState([]);

  useEffect(() => {
    if (inputRegionCategory) {
      if (inputRegionCategory === "5개 권역" || inputRegionCategory === "9개 지역") {
        setPatterns(Object.keys(usRegions[inputRegionCategory]));
      } else if (inputRegionCategory === "52개 주") {
        setPatterns(usRegions["52개 주"]);
      }
    } else {
      setPatterns([]);
    }
  }, [inputRegionCategory, inputArea]);

  const handleRegionCategoryChange = (e) => {
    setInputRegionCategory(e.target.value);
    setInputArea(""); // Reset the second FormControl
  };

  return (
    <Box style={{ display: "flex", gap: "16px", width: "100%", ...style }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="input-regionCategory">지역 구분</InputLabel>
        <Select
          labelId="input-regionCategory"
          id="input-regionCategory-select"
          value={inputRegionCategory}
          label="RegionCategory"
          onChange={handleRegionCategoryChange}
        >
          {regionCategory.map((region, index) => (
            <MenuItem key={index} value={region}>
              {region}
            </MenuItem>
          ))}
          <MenuItem value="">Clear Selection</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="input-pattern">선택</InputLabel>
        <Select
          labelId="input-pattern"
          id="input-pattern-select"
          value={inputArea}
          label="pattern"
          onChange={(e) => setInputArea(e.target.value)}
        >
          {patterns.map((pattern, index) => (
            <MenuItem key={index} value={pattern}>
              {pattern}
            </MenuItem>
          ))}
          <MenuItem value="">Clear Selection</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

const RegionTrends = () => {
  const [inputRegionCategory, setInputRegionCategory] = useState("");
  const [inputArea, setInputArea] = useState("");

  const [data, setData] = useState([]);
  const [rawData, setRawData] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const handleClickOpen = (image) => {
    const selected = data.find((item) => item.image === image);
    setSelectedData(selected);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedData(null);
  };

  // Firestore 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      const summaryDocRef = doc(db, "summary", "areaColorPatternCounts");
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
    if (inputRegionCategory && inputArea) {
      let filteredStates = [];
      if (inputRegionCategory === "5개 권역" || inputRegionCategory === "9개 지역") {
        filteredStates = usRegions[inputRegionCategory][inputArea];
      } else if (inputRegionCategory === "52개 주") {
        filteredStates = [inputArea];
      }

      const colorPatternCounts = {};
      let totalFilteredDataCount = 0;

      filteredStates.forEach((state) => {
        if (rawData[state]) {
          const colors = rawData[state];
          Object.entries(colors).forEach(([color, patterns]) => {
            Object.entries(patterns).forEach(([pattern, count]) => {
              totalFilteredDataCount += count;
              if (!colorPatternCounts[color]) {
                colorPatternCounts[color] = {};
              }
              if (!colorPatternCounts[color][pattern]) {
                colorPatternCounts[color][pattern] = 0;
              }
              colorPatternCounts[color][pattern] += count;
            });
          });
        }
      });

      const calculatedData = [];

      // Calculate the percentage of each color-pattern combination
      Object.entries(colorPatternCounts).forEach(([color, patterns]) => {
        Object.entries(patterns).forEach(([pattern, count]) => {
          const percentage = (count / totalFilteredDataCount) * 100;
          calculatedData.push({
            color: color,
            pattern: pattern,
            percentage: percentage,
            image: "/imgs/" + pattern + "_" + color + ".jpg", // Replace this with actual image URLs if available
          });
        });
      });

      // Sort by percentage and then assign ranks
      calculatedData.sort((a, b) => b.percentage - a.percentage);
      const rankedData = calculatedData.slice(0, 10).map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
      setData(rankedData);
    } else {
      setData([]);
    }
  }, [inputRegionCategory, inputArea, rawData]);

  return (
    <div>
      <Typography variant="h4">지역별 트렌드</Typography>
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
          <Typography variant="h5">Trend by</Typography>
          <RegionInput
            inputRegionCategory={inputRegionCategory}
            setInputRegionCategory={setInputRegionCategory}
            inputArea={inputArea}
            setInputArea={setInputArea}
          />
        </div>
      </div>
      <div style={{ marginBottom: "32px" }}></div>

      <div className="chartContainer">
        <Typography variant="h6">지역별 인기 순위</Typography>
        <RegionChart inputRegionCategory={inputRegionCategory} inputArea={inputArea} />
      </div>

      <TableContainer component={Paper} style={{ marginTop: "40px" }}>
        {data.length !== 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Pattern</TableCell>
                <TableCell>Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.rank}>
                  <TableCell>{row.rank}</TableCell>
                  <TableCell>
                    <img
                      src={row.image}
                      alt="Example"
                      style={{ width: 50, height: 50, cursor: "pointer" }}
                      onClick={() => handleClickOpen(row.image)}
                    />
                  </TableCell>
                  <TableCell>{row.color}</TableCell>
                  <TableCell>{row.pattern}</TableCell>
                  <TableCell>{row.percentage.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Image</DialogTitle>
        <DialogContent>
          Color: {selectedData?.color}
          <br />
          Pattern: {selectedData?.pattern}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RegionTrends;
