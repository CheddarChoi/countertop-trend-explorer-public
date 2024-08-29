import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  Typography,
} from "@mui/material";
import ImageListComponent from "./ImageList";
import { db } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CountertopsIcon from "@mui/icons-material/Countertops";
import KitchenIcon from "@mui/icons-material/Kitchen";
import TextureIcon from "@mui/icons-material/Texture";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import EditIcon from "@mui/icons-material/Edit";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import CloseIcon from "@mui/icons-material/Close";

import { countertop_color_mapping, countertop_pattern_mapping } from "../data/categories";

const Entity = ({ icon, value, image, setEditImage }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "background.paper",
        color: "text.secondary",
        gap: "8px",
        margin: "4px 0",
      }}
    >
      {icon}
      <Divider orientation="vertical" variant="middle" flexItem />
      {value.toString().startsWith("http") ? (
        <a href={value} target="_blank" rel="noreferrer">
          Houzz Link
        </a>
      ) : (
        value
      )}
      {image && setEditImage && (
        <IconButton aria-label="delete" size="small" onClick={() => setEditImage(image)}>
          <EditIcon fontSize="inherit" />
        </IconButton>
      )}
    </Box>
  );
};

const EditModal = ({ editImage, handleClose, setMessage, setNeedUpdate }) => {
  const [mainColor, setMainColor] = useState(editImage.main_color);
  const [mainPattern, setMainPattern] = useState(editImage.main_pattern);
  const [subColor, setSubColor] = useState(editImage.sub_color);
  const [subPattern, setSubPattern] = useState(editImage.sub_pattern);

  const [loading, setLoading] = useState(false);

  const deleteImage = async (id) => {
    await deleteDoc(doc(db, "data", id));
    setMessage("이미지가 삭제되었습니다.");
    handleClose();
    setNeedUpdate(true);
  };

  const updateImage = async (id, mainColor, mainPattern, subColor, subPattern) => {
    console.log(editImage, mainColor, mainPattern, subColor, subPattern);
    if (
      editImage.main_color === mainColor &&
      editImage.main_pattern === mainPattern &&
      editImage.sub_color === subColor &&
      editImage.sub_pattern === subPattern
    ) {
      handleClose();
    } else {
      setLoading(true);
      await updateDoc(doc(db, "data", id), {
        main_color: mainColor,
        main_color_certainty: mainColor === null ? null : 100,
        main_pattern: mainPattern,
        main_pattern_certainty: mainPattern === null ? null : 100,
        sub_color: subColor,
        sub_color_certainty: subColor === null ? null : 100,
        sub_pattern: subPattern,
        sub_pattern_certainty: subPattern === null ? null : 100,
      });
      setLoading(false);
      setMessage("이미지가 업데이트되었습니다.");
      handleClose();
      setNeedUpdate(true);
    }
  };

  return (
    <Modal
      open={editImage}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="modal-modal-title" variant="h6" component="h2">
          이미지 세부 정보 수정
        </Typography>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
          <FormControl fullWidth size="small">
            <InputLabel id="main-color">Main Countertop Color</InputLabel>
            <Select
              labelId="main-color"
              id="main-color-select"
              value={mainColor}
              label="Main Countertop Color"
              onChange={(e) => setMainColor(e.target.value)}
            >
              {Object.keys(countertop_color_mapping).map((color) => (
                <MenuItem key={color} value={color}>
                  {color}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="main-pattern">Main Countertop Pattern</InputLabel>
            <Select
              labelId="main-pattern"
              id="main-pattern-select"
              value={mainPattern}
              label="Main Countertop Pattern"
              onChange={(e) => setMainPattern(e.target.value)}
            >
              {Object.keys(countertop_pattern_mapping).map((pattern) => (
                <MenuItem key={pattern} value={pattern}>
                  {pattern}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="sub-color">Sub Countertop Color</InputLabel>
            <Select
              labelId="sub-color"
              id="sub-color-select"
              value={subColor}
              label="Sub Countertop Color"
              onChange={(e) => setSubColor(e.target.value)}
            >
              {Object.keys(countertop_color_mapping).map((color) => (
                <MenuItem key={color} value={color}>
                  {color}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="sub-pattern">Sub Countertop Pattern</InputLabel>
            <Select
              labelId="sub-pattern"
              id="sub-pattern-select"
              value={subPattern}
              label="Sub Countertop Pattern"
              onChange={(e) => setSubPattern(e.target.value)}
            >
              {Object.keys(countertop_pattern_mapping).map((pattern) => (
                <MenuItem key={pattern} value={pattern}>
                  {pattern}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                updateImage(editImage.id, mainColor, mainPattern, subColor, subPattern);
              }}
              style={{ width: "48%" }}
              disabled={loading}
            >
              업데이트
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleClose}
              style={{ width: "48%" }}
            >
              취소
            </Button>
          </div>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => deleteImage(editImage.id)}
            disabled={loading}
          >
            이미지 삭제
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

const ImageExplorer = ({
  inputColor,
  inputPattern,
  inputType,
  surroundingInputType,
  surroundingInputValue,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [fullSize, setFullSize] = useState(false);
  const [message, setMessage] = useState("");
  const [needUpdate, setNeedUpdate] = useState(false);

  useEffect(() => {
    setFullSize(false);
  }, [selectedImage]);

  const handleClose = () => {
    setEditImage(null);
  };

  const height = inputType === "countertop" ? "610px" : "410px";
  const listHeight = inputType === "countertop" ? "400px" : "200px";

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6} style={{ height: "100%" }}>
          <div
            className="chartContainer"
            style={{ height: height, display: "flex", flexDirection: "column" }}
          >
            {inputType === "countertop" ? (
              <>
                <Typography variant="h6">적용 사례 이미지 (Main Countertop)</Typography>
                <ImageListComponent
                  inputColor={inputColor}
                  inputPattern={inputPattern}
                  inputType={"main"}
                  surroundingInputType={surroundingInputType}
                  surroundingInputValue={surroundingInputValue}
                  setSelectedImage={setSelectedImage}
                  needUpdate={needUpdate}
                  setNeedUpdate={setNeedUpdate}
                />
                <Divider style={{ margin: "10px 0" }} />
                <Typography variant="h6">적용 사례 이미지 (Sub Countertop)</Typography>
                <ImageListComponent
                  inputColor={inputColor}
                  inputPattern={inputPattern}
                  inputType={"sub"}
                  surroundingInputType={surroundingInputType}
                  surroundingInputValue={surroundingInputValue}
                  setSelectedImage={setSelectedImage}
                  needUpdate={needUpdate}
                  setNeedUpdate={setNeedUpdate}
                />
              </>
            ) : (
              <>
                <Typography variant="h6">적용 사례 이미지</Typography>
                <ImageListComponent
                  inputColor={inputColor}
                  inputPattern={inputPattern}
                  inputType={inputType}
                  surroundingInputType={surroundingInputType}
                  surroundingInputValue={surroundingInputValue}
                  setSelectedImage={setSelectedImage}
                  needUpdate={needUpdate}
                  setNeedUpdate={setNeedUpdate}
                />
              </>
            )}
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className="chartContainer" style={{ height: height }}>
            <div>
              {selectedImage ? (
                <div>
                  <div style={{ position: "relative", height: listHeight }}>
                    <img
                      src={selectedImage.img_src}
                      alt={selectedImage.id}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: fullSize ? "cover" : "scale-down",
                        maxHeight: listHeight,
                      }}
                    />
                    <IconButton
                      onClick={() => setFullSize(!fullSize)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        bottom: "10px",
                        color: "black",
                      }}
                    >
                      {fullSize ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
                    </IconButton>
                  </div>
                  <div style={{ marginTop: "20px" }}>
                    <Entity icon={<CalendarTodayIcon />} value={selectedImage.year} />
                    <Entity icon={<LocationOnIcon />} value={selectedImage.location} />
                    <Entity
                      icon={<CountertopsIcon />}
                      value={
                        selectedImage.main_color
                          ? `(Main) ${selectedImage.main_color} / ${selectedImage.main_pattern}`
                          : "(Main) Unknown"
                      }
                      image={selectedImage}
                      setEditImage={setEditImage}
                    />
                    <Entity
                      icon={<CountertopsIcon />}
                      value={
                        selectedImage.sub_color
                          ? `(Sub) ${selectedImage.sub_color} / ${selectedImage.sub_pattern}`
                          : "(Sub) Unknown"
                      }
                      image={selectedImage}
                      setEditImage={setEditImage}
                    />
                    <Entity
                      icon={<KitchenIcon />}
                      value={
                        selectedImage.cabinet_color
                          ? `${selectedImage.cabinet_color} / ${selectedImage.cabinet_type}`
                          : "Unknown"
                      }
                    />
                    <Entity
                      icon={<TextureIcon />}
                      value={selectedImage.floor_color ? selectedImage.floor_color : "Unknown"}
                    />
                    <Entity icon={<InsertLinkIcon />} value={selectedImage.url} />
                  </div>
                </div>
              ) : (
                <div>Click an image to view</div>
              )}
            </div>
          </div>
        </Grid>
      </Grid>
      {editImage && (
        <EditModal
          editImage={editImage}
          handleClose={handleClose}
          setMessage={setMessage}
          setNeedUpdate={setNeedUpdate}
        />
      )}
      <Snackbar
        open={message}
        autoHideDuration={6000}
        onClose={() => {
          setMessage("");
        }}
        message={message}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => {
              setMessage("");
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export default ImageExplorer;
