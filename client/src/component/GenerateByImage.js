import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Button, styled, Typography } from "@mui/material";
import { getRecommendation, uploadImage } from "../api/server";
import ServerSettingDialog from "./ServerSettingDialog";

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

const GenerateByImage = ({ generating, setGenerating, setInputType }) => {
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const addGeneratedImage = (image) => dispatch({ type: "ADD_GENERATED_IMAGE", payload: image });
  const updateLastGeneratedImage = (image) =>
    dispatch({ type: "UPDATE_LAST_GENERATED_IMAGE", payload: image });

  const BASE_URL = process.env.REACT_APP_SERVER_URL;
  const handleFileChange = async (event) => {
    setError(null);
    setGenerating(true);
    const file = event.target.files[0];
    if (!file) {
      alert("Please select a file to upload");
      return;
    }
    uploadImage(file)
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
        } else setError(err.response.data.error ? err.response.data.error : "Error uploading file");
      });

    event.target.value = null;
  };

  return (
    <>
      <Box sx={{ mt: "24px" }}>
        <Typography variant="body" sx={{ mt: "8px" }}>
          이미지 파일을 업로드해주세요.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            sx={{ mt: "16px" }}
            disabled={generating}
          >
            <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
            업로드
          </Button>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: "16px" }}
            onClick={() => {
              setInputType("");
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

export default GenerateByImage;
