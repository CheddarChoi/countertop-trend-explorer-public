import React, { useState } from "react";
import { Box, Button, CircularProgress, Divider, Link, styled, Typography } from "@mui/material";
import KitchenIcon from "@mui/icons-material/Kitchen";
import TextureIcon from "@mui/icons-material/Texture";
import DownloadIcon from "@mui/icons-material/Download";

const Entity = ({ icon, value }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        color: "text.secondary",
        gap: "8px",
      }}
    >
      {icon}
      <Divider orientation="vertical" variant="middle" flexItem />
      {value}
    </Box>
  );
};

const SlabCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
  backgroundColor: "white",
  padding: "12px",
  borderRadius: "10px",
  boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
}));

const GenerativePanel = ({ generateImage }) => {
  const BASE_URL = process.env.REACT_APP_SERVER_URL;
  const [selected, setSelected] = useState(-1);

  return (
    <div style={{ display: "flex", gap: "16px", width: "100%" }}>
      <img
        src={
          selected === -1
            ? generateImage.url
            : BASE_URL + "/" + generateImage.slabs[selected].generated_kitchen_url
        }
        alt={`Generated`}
        style={{ width: "280px", height: "280px", objectFit: "cover" }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          gap: "20px",
          flex: 1,
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            gap: "8px",
          }}
        >
          <hr style={{ width: "50px", margin: "0" }} />
          <Typography variant="h6">주방 특징</Typography>
          <Entity
            icon={<KitchenIcon />}
            value={`${generateImage.features.cabinet.color} / ${generateImage.features.cabinet.type}`}
          />
          <Entity icon={<TextureIcon />} value={generateImage.features.floor.color} />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            gap: "8px",
            position: "relative",
          }}
        >
          <hr style={{ width: "50px", margin: "0" }} />
          <Typography variant="h6">어울리는 상판</Typography>
          <div
            style={{
              display: "flex",
              gap: "16px",
              padding: "10px 2px",
              overflowX: "auto",
              borderRadius: "10px",
            }}
          >
            {generateImage.slabs.length === 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
                <Typography variant="body1">어울리는 상판 탐색중...</Typography>
              </div>
            )}
            {generateImage.slabs.map((slab, index) => (
              <SlabCard
                key={index}
                onClick={() => {
                  if (selected === index) setSelected(-1);
                  else setSelected(index);
                }}
                style={{
                  border: selected === index ? "2px solid #6AD2FF" : "none",
                  margin: selected === index ? "-2px" : "0",
                }}
              >
                <img
                  src={BASE_URL + "/" + slab.url}
                  alt={`Slab ${index}`}
                  style={{ width: "64px", height: "64px", objectFit: "cover" }}
                />
                <div>
                  <Typography variant="h6" style={{ textAlign: "center" }}>
                    {slab.color} / {slab.pattern}
                  </Typography>
                  <Typography variant="body2" style={{ textAlign: "center" }}>
                    {slab.type}
                  </Typography>
                </div>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  href={BASE_URL + "/" + slab.url}
                  target="_blank"
                >
                  Download
                </Button>
              </SlabCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerativePanel;
