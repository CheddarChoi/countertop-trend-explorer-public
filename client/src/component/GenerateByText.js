import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Button, TextField } from "@mui/material";
import { generateImage, getRecommendation } from "../api/server";
import ServerSettingDialog from "./ServerSettingDialog";

const GenerateByText = ({ generating, setGenerating, setInputType }) => {
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const addGeneratedImage = (image) => dispatch({ type: "ADD_GENERATED_IMAGE", payload: image });
  const updateLastGeneratedImage = (image) =>
    dispatch({ type: "UPDATE_LAST_GENERATED_IMAGE", payload: image });

  const BASE_URL = process.env.REACT_APP_SERVER_URL;
  const [inputText, setInputText] = useState("");

  const generateWithText = (text) => {
    setGenerating(true);
    setError(null);
    generateImage(text)
      .then((data) => {
        setGenerating(false);
        addGeneratedImage({
          features: data.features,
          slabs: [],
          url: BASE_URL + "/images/" + data.filename,
        });
        getRecommendation(data.filename, data.features)
          .then((data) => {
            updateLastGeneratedImage({
              features: data.features,
              slabs: data.slabs,
              url: BASE_URL + "/images/" + data.filename,
            });
          })
          .catch((err) => {
            setError(
              err.response.data.error ? err.response.data.error : "Error getting recommendation"
            );
          });
      })
      .catch((err) => {
        setGenerating(false);
        if (err.code === "ERR_NETWORK") {
          setError("Instruction");
          return;
        } else
          setError(err.response.data.error ? err.response.data.error : "Error generating image");
      });
  };

  return (
    <>
      <Box sx={{ mt: "24px" }}>
        <TextField
          id="text-input"
          label=""
          helperText="e.g., 따뜻한 느낌의 현대적인 주방"
          variant="outlined"
          InputProps={{ sx: { borderRadius: "10px", width: "400px" } }}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={generating}
        />
        <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: "16px" }}
            onClick={() => generateWithText(inputText)}
            disabled={generating || inputText === ""}
          >
            {generating ? "생성 중..." : "생성하기"}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: "16px" }}
            onClick={() => {
              setInputType("");
              setInputText("");
            }}
          >
            뒤로
          </Button>
        </Box>
      </Box>
      <ServerSettingDialog open={error !== null} onClose={() => setError(null)} message={error} />
    </>
  );
};

export default GenerateByText;
