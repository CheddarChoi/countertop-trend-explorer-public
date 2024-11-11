import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Button, Grid, Typography, styled } from "@mui/material";
import ServerSettingDialog from "../../component/ServerSettingDialog";
import { editSlabImage, uploadSlabImage } from "../../api/server";

import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ImageIcon from "@mui/icons-material/Image";
import {
  SurroundingElementsInput,
  surroundingElementTypes,
} from "../TrendAnalysis/SurroundingElementsBased";
import { RegionInput } from "../TrendAnalysis/RegionTrend";
import { ColorPatternInput } from "../TrendAnalysis/ColorPatternBased";

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

const CustomContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  padding: "30px",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "20px",
  background: "white",
});

const Bar = styled("div")({
  width: "1px",
  height: "125px",
  backgroundColor: "black",
  position: "absolute",
  top: -125,
  left: "50%",
});

const PromptButton = styled(Button)({
  padding: "16px 20px",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "4px",
  borderRadius: "16px",
  border: "1px solid #B6B6B6",
  backgroundColor: "#FFFFFF",
  boxShadow: "0px 18px 40px 0px rgba(112, 144, 176, 0.12)",
  color: "#2B3674",
  textTransform: "none",
  width: "100%",
  textAlign: "left",
  lineHeight: 1.5,
  fontSize: "16px",
});

const SubpromptButton = styled(Button)({
  padding: "12px 16px",
  flexDirection: "column",
  alignItems: "flex-start",
  borderRadius: "16px",
  border: "1px solid #B6B6B6",
  backgroundColor: "#FFFFFF",
  boxShadow: "0px 18px 40px 0px rgba(112, 144, 176, 0.12)",
  color: "#2B3674",
  textTransform: "none",
  width: "100%",
  textAlign: "left",
  lineHeight: 1.5,
  fontSize: "14px",
});

const changePrompt2String = (prompt) => {
  console.log(prompt);
  let promptString = "";
  if (prompt.promptType === "recentTrend") {
    if (prompt.trendRange === "1year") {
      promptString += "최근 1년 트렌드";
    } else if (prompt.trendRange === "3year") {
      promptString += "최근 3년 트렌드";
    } else if (prompt.trendRange === "total") {
      promptString += "전체 트렌드";
    }
  } else if (prompt.promptType === "surroundings") {
    if (prompt.surrounding["floor_color"]) {
      promptString += prompt.surrounding["floor_color"] + " 바닥재";
    }
    if (prompt.surrounding["cabinet_color"]) {
      promptString += prompt.surrounding["cabinet_color"] + " 캐비닛";
    }
    if (prompt.surrounding["cabinet_type"]) {
      promptString += prompt.surrounding["cabinet_type"] + " 캐비닛";
    }
  } else if (prompt.promptType === "region") {
    let key = Object.keys(prompt.region)[0];
    promptString += prompt.region[key] + " 지역";
  } else if (prompt.promptType === "manual") {
    promptString += prompt.inputted_info["color"] + ", " + prompt.inputted_info["pattern"];
  }
  return promptString + "에 맞게 상판 디자인을 수정해줘";
};

const EditTools = () => {
  const BASE_URL = process.env.REACT_APP_SERVER_URL;

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageProps, setUploadedImageProps] = useState(null);
  const [generatedSlabs, setGeneratedSlabs] = useState([]);
  const [selectedPromptType, setSelectedPromptType] = useState(null);
  const [trendRange, setTrendRange] = useState(null);
  const [surroundingType, setSurroundingType] = useState(null);
  const [selectedSurroundingValue, setSelectedSurroundingValue] = useState(null);
  const [regionCategory, setRegionCategory] = useState(null);
  const [selectedRegionValue, setSelectedRegionValue] = useState(null);
  const [selectedColorValue, setSelectedColorValue] = useState(null);
  const [selectedPatternValue, setSelectedPatternValue] = useState(null);

  const generatedSlabHistories = useSelector((state) => state.generatedSlabs);

  const dispatch = useDispatch();
  const clearGeneratedSlabs = () => {
    dispatch({ type: "CLEAR_GENERATED_SLABS" });
  };
  const addGeneratedSlab = (slabs) => dispatch({ type: "ADD_GENERATED_SLAB", payload: slabs });

  const handleFileChange = async (event) => {
    setError(null);
    setGenerating(true);
    setUploadedImageProps(null);
    const file = event.target.files[0];
    if (!file) {
      alert("Please select a file to upload");
      return;
    }
    uploadSlabImage(file)
      .then((data) => {
        setUploadedImage(data.filename);
        setGenerating(false);
      })
      .catch((err) => {
        setError(
          err.response.data.error ? err.response.data.error : "Error getting recommendation"
        );
        setGenerating(false);
      });
  };

  const handleSubmitPrompt = () => {
    setError(null);
    if (!uploadedImage) {
      alert("Please upload an image first");
      return;
    }

    if (selectedPromptType === "recentTrend" && !trendRange) {
      alert("Please select a trend range");
      return;
    }
    if (selectedPromptType === "surroundings" && !selectedSurroundingValue) {
      alert("Please select a surrounding value");
      return;
    }
    if (selectedPromptType === "region" && !selectedRegionValue) {
      alert("Please select a region value");
      return;
    }
    if (selectedPromptType === "manual") {
      if (!selectedColorValue && !selectedPatternValue) {
        alert("Please select color and pattern values");
      } else if (!selectedColorValue) {
        alert("Please select a color value");
      } else if (!selectedPatternValue) {
        alert("Please select a pattern value");
      }
    }

    setGenerating(true);

    let surrounding = {};
    if (surroundingType)
      surrounding[surroundingElementTypes[surroundingType].id] = selectedSurroundingValue;

    let region = {};
    region[regionCategory] = selectedRegionValue;

    let inputted_info = {};
    inputted_info["color"] = selectedColorValue;
    inputted_info["pattern"] = selectedPatternValue;

    editSlabImage(
      uploadedImage,
      0.7,
      selectedPromptType,
      trendRange,
      surrounding,
      region,
      inputted_info
    )
      .then((data) => {
        setUploadedImageProps({
          color: data.original_slab.color,
          pattern: data.original_slab.pattern,
        });
        setGeneratedSlabs(data.edited_slabs);
        addGeneratedSlab({
          prompt: changePrompt2String({
            promptType: selectedPromptType,
            trendRange: trendRange,
            surrounding: surrounding,
            region: region,
            inputted_info: inputted_info,
          }),
          ...data,
        });
        setGenerating(false);
      })
      .catch((err) => {
        setError(
          err.response.data.error ? err.response.data.error : "Error getting recommendation"
        );
        setGenerating(false);
      });
  };

  return (
    <Box>
      <Typography variant="h4">트렌드에 맞게 상판 디자인을 수정해보세요.</Typography>

      <Box
        sx={{
          mt: "24px",
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          alignItems: "center",
          width: "100%",
        }}
      >
        <CustomContainer
          style={{
            width: "200px",
            height: generatedSlabs.length > 0 ? "250px" : "200px",
            textAlign: "center",
          }}
        >
          {uploadedImage ? (
            <>
              <img
                src={BASE_URL + "/images/edit_slab/original/" + uploadedImage}
                alt="uploaded"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              {uploadedImageProps && (
                <div style={{ fontSize: "14px" }}>
                  {uploadedImageProps.color} <br /> {uploadedImageProps.pattern}
                </div>
              )}
            </>
          ) : (
            <>
              <ImageIcon sx={{ fontSize: 48 }} />
              <Button
                component="label"
                role={undefined}
                variant="outlined"
                tabIndex={-1}
                disabled={generating}
              >
                <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
                업로드
              </Button>
              <ServerSettingDialog
                open={error !== null}
                onClose={() => setError(null)}
                message={error}
              />
            </>
          )}
        </CustomContainer>
        <KeyboardDoubleArrowRightIcon sx={{ fontSize: 40 }} />
        <CustomContainer
          style={{ height: generatedSlabs.length > 0 ? "250px" : "200px", flex: "1" }}
        >
          {generatedSlabs.length > 0 && (
            <Grid container spacing={2}>
              {generatedSlabs.map((slab, index) => (
                <Grid item xs={3} key={index} style={{ textAlign: "center" }}>
                  <div>
                    <img
                      key={index}
                      src={BASE_URL + "/" + slab.url}
                      alt="generated"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        marginBottom: "8px",
                      }}
                    />
                    <div style={{ fontSize: "14px" }}>
                      {slab.color} <br /> {slab.pattern}
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          )}
        </CustomContainer>
      </Box>
      <CustomContainer
        style={{
          position: "relative",
          marginLeft: "calc(200px + 32px + 36px - 200px)",
          marginTop: "32px",
          width: "400px",
        }}
      >
        <Bar />
        <Typography variant="h5">프롬프트를 선택하세요.</Typography>
        {selectedPromptType ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              alignItems: "center",
              width: "100%",
            }}
          >
            {selectedPromptType === "recentTrend" && (
              <Box sx={{ display: "flex", gap: "16px", width: "100%" }}>
                <SubpromptButton
                  onClick={() => {
                    setTrendRange("1year");
                  }}
                  style={{
                    backgroundColor: trendRange === "1year" ? "#EEEEEE" : "white",
                    border: trendRange === "1year" ? "1px solid #2B3674" : "1px solid #B6B6B6",
                  }}
                  disabled={generating}
                >
                  <b>최근 1년</b> 트렌드 기반으로 디자인 수정하기
                </SubpromptButton>
                <SubpromptButton
                  onClick={() => {
                    setTrendRange("3year");
                  }}
                  style={{
                    backgroundColor: trendRange === "3year" ? "#EEEEEE" : "white",
                    border: trendRange === "3year" ? "1px solid #2B3674" : "1px solid #B6B6B6",
                  }}
                  disabled={generating}
                >
                  <b>최근 3년</b> 트렌드 기반으로 디자인 수정하기
                </SubpromptButton>
                <SubpromptButton
                  onClick={() => {
                    setTrendRange("total");
                  }}
                  style={{
                    backgroundColor: trendRange === "total" ? "#EEEEEE" : "white",
                    border: trendRange === "total" ? "1px solid #2B3674" : "1px solid #B6B6B6",
                  }}
                  disabled={generating}
                >
                  <b>전체</b> 트렌드 기반으로 디자인 수정하기
                </SubpromptButton>
              </Box>
            )}
            {selectedPromptType === "surroundings" && (
              <>
                주변요소를 선택하세요.
                <SurroundingElementsInput
                  inputType={surroundingType}
                  setInputType={setSurroundingType}
                  inputValue={selectedSurroundingValue}
                  setInputValue={setSelectedSurroundingValue}
                  style={{ justifyContent: "center" }}
                  disabled={generating}
                />
              </>
            )}
            {selectedPromptType === "region" && (
              <>
                지역을 선택하세요.
                <RegionInput
                  inputRegionCategory={regionCategory}
                  setInputRegionCategory={setRegionCategory}
                  inputArea={selectedRegionValue}
                  setInputArea={setSelectedRegionValue}
                  style={{ justifyContent: "center" }}
                  disabled={generating}
                />
              </>
            )}
            {selectedPromptType === "manual" && (
              <>
                컬러와 패턴을 선택하세요.
                <ColorPatternInput
                  inputColor={selectedColorValue}
                  setInputColor={setSelectedColorValue}
                  inputPattern={selectedPatternValue}
                  setInputPattern={setSelectedPatternValue}
                  style={{ justifyContent: "center" }}
                />
              </>
            )}
            <Box sx={{ display: "flex", gap: "16px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitPrompt}
                disabled={generating}
              >
                {generating ? "수정 중..." : "수정하기"}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setSelectedPromptType(null);
                  setTrendRange(null);
                  setSurroundingType(null);
                  setSelectedSurroundingValue(null);
                  setRegionCategory(null);
                  setSelectedRegionValue(null);
                  setSelectedColorValue(null);
                  setSelectedPatternValue(null);
                }}
                disabled={generating}
              >
                뒤로
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <PromptButton
              onClick={() => {
                setSelectedPromptType("recentTrend");
              }}
            >
              최근 트렌드에 맞추어 수정하기
              <span style={{ color: "#A3AED0", fontSize: "14px" }}>
                최근 1년, 3년, 전체 트렌드를 반영하여 수정합니다.
              </span>
            </PromptButton>
            <PromptButton
              onClick={() => {
                setSelectedPromptType("surroundings");
              }}
            >
              주변요소에 맞추어 수정하기
              <span style={{ color: "#A3AED0", fontSize: "14px" }}>
                함께 사용되는 캐비닛, 바닥재에 맞추어 수정합니다.
              </span>
            </PromptButton>
            <PromptButton
              onClick={() => {
                setSelectedPromptType("region");
              }}
            >
              지역 트렌드에 맞추어 수정하기
              <span style={{ color: "#A3AED0", fontSize: "14px" }}>
                특정 지역에서 선호하는 상판 디자인을 반영하여 수정합니다.
              </span>
            </PromptButton>
            <PromptButton
              onClick={() => {
                setSelectedPromptType("manual");
              }}
            >
              원하는 컬러/패턴에 맞추어 수정하기
              <span style={{ color: "#A3AED0", fontSize: "14px" }}>
                컬러와 패턴을 직접 지정하여 슬랩을 수정합니다.
              </span>
            </PromptButton>
          </>
        )}
      </CustomContainer>
      {generatedSlabHistories.length > 0 && (
        <Box sx={{ mt: "24px", width: "100%" }}>
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h5" sx={{ marginTop: "50px" }}>
              수정된 상판 히스토리
            </Typography>
            <Button variant="outlined" color="primary" onClick={() => clearGeneratedSlabs()}>
              초기화
            </Button>
          </div>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: "16px", mt: "16px", mb: "100px" }}
          >
            {generatedSlabHistories.map((history, index) => (
              <div style={{ marginBottom: "24px" }}>
                <Box
                  sx={{
                    mt: "24px",
                    display: "flex",
                    flexDirection: "row",
                    gap: "16px",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <CustomContainer
                    style={{
                      width: "200px",
                      height: "250px",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={BASE_URL + "/" + history.original_slab.url}
                      alt="uploaded"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                    <div style={{ fontSize: "14px" }}>
                      {history.original_slab.color} <br /> {history.original_slab.pattern}
                    </div>
                  </CustomContainer>
                  <KeyboardDoubleArrowRightIcon sx={{ fontSize: 40 }} />
                  <CustomContainer style={{ height: "250px", flex: "1", maxWidth: "900px" }}>
                    <Grid container spacing={2}>
                      {history.edited_slabs.map((slab, index) => (
                        <Grid item xs={3} key={index} style={{ textAlign: "center" }}>
                          <div>
                            <img
                              key={index}
                              src={BASE_URL + "/" + slab.url}
                              alt="generated"
                              style={{
                                width: "100%",
                                height: "100%",
                                maxWidth: "200px",
                                objectFit: "contain",
                                marginBottom: "8px",
                              }}
                            />
                            <div style={{ fontSize: "14px" }}>
                              {slab.color} <br /> {slab.pattern}
                            </div>
                          </div>
                        </Grid>
                      ))}
                    </Grid>
                  </CustomContainer>
                </Box>
                <CustomContainer
                  style={{
                    position: "relative",
                    marginLeft: "calc(200px + 32px + 36px - 150px)",
                    marginTop: "32px",
                    width: "300px",
                    textAlign: "center",
                  }}
                >
                  <Bar />
                  <Typography variant="h6">{history.prompt}</Typography>
                </CustomContainer>
              </div>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EditTools;
