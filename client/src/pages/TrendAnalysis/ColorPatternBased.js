import React, { useState } from "react";
import { Button, Typography, styled } from "@mui/material";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import { countertop_pattern, countertop_color_mapping } from "../../data/categories";
import ColorPatternDashboard from "../../component/ColorPatternDashboard";
import { analyzeImage } from "../../api/server";
import ServerSettingDialog from "../../component/ServerSettingDialog";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ColorPatternBased = () => {
  const [inputColor, setInputColor] = useState("");
  const [inputPattern, setInputPattern] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    console.log(file);
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await analyzeImage(file);
      console.log(data.message);
      setLoading(false);
      if (data.message === "both" || data.message === "main") {
        setInputColor(data.result.main_countertop.color);
        setInputPattern(data.result.main_countertop.pattern);
      } else if (data.message === "sub") {
        setInputColor(data.result.sub_countertop.color);
        setInputPattern(data.result.sub_countertop.pattern);
      } else {
        setError("이미지에서 주방 상판을 찾을 수 없습니다. 다른 이미지로 다시 시도해주세요.");
        return;
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      if (err.code === "ERR_NETWORK") {
        setError("Instruction");
        return;
      } else setError(err.response ? err.response.data : "Error uploading file");
    }
  };

  return (
    <div>
      <Typography variant="h4">표면소재 컬러/패턴별 트렌드</Typography>
      <div
        style={{
          marginTop: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
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
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="input-color">Color</InputLabel>
            <Select
              labelId="input-color"
              id="input-color-select"
              value={inputColor}
              label="Color"
              onChange={(e) => setInputColor(e.target.value)}
            >
              {Object.keys(countertop_color_mapping).map((color) => (
                <MenuItem key={color} value={color}>
                  {color}
                </MenuItem>
              ))}
              <MenuItem value="">Clear Selection</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="input-pattern">Pattern</InputLabel>
            <Select
              labelId="input-pattern"
              id="input-pattern-select"
              value={inputPattern}
              label="pattern"
              onChange={(e) => setInputPattern(e.target.value)}
            >
              {countertop_pattern.map((pattern) => (
                <MenuItem key={pattern} value={pattern}>
                  {pattern}
                </MenuItem>
              ))}
              <MenuItem value="">Clear Selection</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "end", maxWidth: "30%" }}
        >
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={loading ? null : <AddPhotoAlternateIcon />}
            disabled={loading}
          >
            {loading ? "Loading..." : "Upload Image"}
            <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
          </Button>
          <ServerSettingDialog
            open={error !== null}
            onClose={() => setError(null)}
            message={error}
          />
        </div>
      </div>
      <ColorPatternDashboard inputColor={inputColor} inputPattern={inputPattern} />
    </div>
  );
};

export default ColorPatternBased;
