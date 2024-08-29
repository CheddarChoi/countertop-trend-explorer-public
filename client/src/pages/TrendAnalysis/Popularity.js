import React, { useEffect, useState } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { countertop_color_mapping, countertop_pattern_mapping } from "../../data/categories";

import ColorPatternDashboard from "../../component/ColorPatternDashboard";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const Popularity = () => {
  const [rawdata, setRawData] = useState({});
  const [data, setData] = useState({});

  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [filteredYear, setFilteredYear] = useState(0);

  useEffect(() => {
    const fetchData = async (filterName) => {
      const summaryDocRef = doc(db, "summaries", "colorPatternCounts");
      const summaryDocSnap = await getDoc(summaryDocRef);

      if (summaryDocSnap.exists()) {
        setRawData(summaryDocSnap.data());
      } else {
        alert("Error: No sumamry document found");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(rawdata).length === 0) return;
    let colorPatternData = {};
    let id;
    if (filteredYear === 0) id = "total";
    else if (filteredYear === 2022) id = "1year";
    else id = "3year";

    let total = 0;
    for (let color in countertop_color_mapping) {
      colorPatternData[color] = {};
      for (let pattern in countertop_pattern_mapping) {
        colorPatternData[color][pattern] = rawdata[color][pattern][id];
        total += rawdata[color][pattern][id];
      }
    }

    let sortedData = [];
    for (let color in countertop_color_mapping) {
      for (let pattern in countertop_pattern_mapping) {
        sortedData.push({
          color: color,
          pattern: pattern,
          percentage: (colorPatternData[color][pattern] / total) * 100,
          image: "/imgs/" + pattern + "_" + color + ".jpg",
        });
      }
    }
    sortedData.sort((a, b) => b.percentage - a.percentage);
    sortedData = sortedData.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
    setData(sortedData);
  }, [filteredYear, rawdata]);

  const handleClickOpen = (image) => {
    const selected = data.find((item) => item.image === image);
    setSelectedData(selected);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedData(null);
  };

  const handleYearChange = (event) => {
    setFilteredYear(event.target.value);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <Typography variant="h4">표면소재 컬러/패턴 인기순위</Typography>

        <FormControl sx={{ width: 160, marginBottom: "12px" }} size="small">
          <InputLabel id="select-small-label">년도</InputLabel>
          <Select
            labelId="select-small-label"
            id="select-small"
            value={filteredYear}
            label="Year"
            onChange={handleYearChange}
          >
            <MenuItem value={0}>전체 데이터</MenuItem>
            <MenuItem value={2022}>1개년 데이터</MenuItem>
            <MenuItem value={2020}>3개년 데이터</MenuItem>
          </Select>
        </FormControl>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Rank</TableCell>
              <TableCell align="center">Image</TableCell>
              <TableCell align="center">Color</TableCell>
              <TableCell align="center">Pattern</TableCell>
              <TableCell align="center">Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(data).length > 0 &&
              data.map((row) => (
                <TableRow
                  key={row.rank}
                  onClick={() => handleClickOpen(row.image)}
                  style={{ cursor: "pointer" }}
                  hover
                >
                  <TableCell align="center">{row.rank}</TableCell>
                  <TableCell align="center">
                    <img
                      src={row.image}
                      alt="Not available"
                      style={{
                        width: 70,
                        height: 70,
                        fontSize: "12px",
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">{row.color}</TableCell>
                  <TableCell align="center">{row.pattern}</TableCell>
                  <TableCell align="center">{row.percentage.toFixed(1)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            background: "#F4F7FE",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "normal" }}>
          Trend of{" "}
          <b>
            {selectedData?.color} X {selectedData?.pattern}
          </b>
        </DialogTitle>
        <DialogContent>
          <ColorPatternDashboard
            inputColor={selectedData?.color}
            inputPattern={selectedData?.pattern}
          />
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

export default Popularity;
