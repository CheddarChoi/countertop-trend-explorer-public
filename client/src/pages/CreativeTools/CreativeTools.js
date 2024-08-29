import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Button, Typography } from "@mui/material";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ImageIcon from "@mui/icons-material/Image";
import GenerateByImage from "../../component/GenerateByImage";
import GenerateByText from "../../component/GenerateByText";
import GenerativePanel from "../../component/GenerativePanel";

const CreativeTools = () => {
  const [inputType, setInputType] = useState("");
  const [generating, setGenerating] = useState(false);

  const generatedImages = useSelector((state) => state.generatedImages);
  console.log(generatedImages);
  const dispatch = useDispatch();
  const clearGeneratedImages = () => {
    dispatch({ type: "CLEAR_GENERATED_IMAGES" });
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4">어떤 주방에 어울리는 상판을 디자인할 예정이신가요?</Typography>
      {inputType === "" && (
        <Box sx={{ display: "flex", gap: "16px", mt: "24px" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<TextFieldsIcon />}
            onClick={() => setInputType("text")}
          >
            텍스트로 입력하기
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ImageIcon />}
            onClick={() => setInputType("image")}
          >
            이미지로 입력하기
          </Button>
        </Box>
      )}
      {inputType === "text" && (
        <GenerateByText
          generating={generating}
          setGenerating={setGenerating}
          setInputType={setInputType}
        />
      )}
      {inputType === "image" && (
        <GenerateByImage
          generating={generating}
          setGenerating={setGenerating}
          setInputType={setInputType}
        />
      )}
      {generatedImages.length > 0 && (
        <Box sx={{ mt: "24px", width: "100%" }}>
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h5" sx={{ margin: 0 }}>
              생성된 이미지
            </Typography>
            <Button variant="outlined" color="primary" onClick={() => clearGeneratedImages()}>
              초기화
            </Button>
          </div>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: "16px", mt: "16px", mb: "100px" }}
          >
            {generatedImages.map((image, index) => (
              <GenerativePanel key={index} generateImage={image} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CreativeTools;
