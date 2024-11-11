import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Divider, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Trend Analysis",
      items: [
        {
          text: "표면소재 트렌드 변화",
          path: "/trend-analysis/time",
          description: "시기별로 많이 사용된 표면소재의 특성을 분석합니다.",
        },
        {
          text: "컬러/패턴별 트렌드",
          path: "/trend-analysis/surface-material/color-pattern",
          description:
            "표면소재의 컬러/패턴별로 많이 사용된 시기, 함께 등장하는 주변요소 등을 분석합니다.",
        },
        {
          text: "주변요소별 트렌드",
          path: "/trend-analysis/surface-material/surrounding-elements",
          description: "주방의 주변요소를 기준으로 함께 많이 사용된 표면소재의 특성을 분석합니다.",
        },
        {
          text: "표면소재 인기순위",
          path: "/trend-analysis/popularity",
          description: "가장 많이 사용된 표면소재의 컬러/패턴 순위를 분석합니다.",
        },
        {
          text: "지역별 트렌드",
          path: "/trend-analysis/region",
          description: "지역별로 많이 사용된 표면소재의 특성을 분석합니다.",
        },
      ],
    },
    {
      title: "Creative Tools",
      items: [
        {
          text: "Creative Tools",
          path: "/creative-tools/generate",
          description: "표면소재 디자인 생성 도구",
        },
        {
          text: "Edit Tools",
          path: "/creative-tools/edit",
          description: "표면소재 디자인 편집 도구",
        },
      ],
    },
  ];

  return (
    <div>
      {menuItems.map((item, index) => (
        <div style={{ margin: "10px 0" }} key={index}>
          {index > 0 && <Divider style={{ margin: "24px 0" }} />}
          <div>
            <Typography variant="h5" style={{ marginBottom: "12px" }}>
              {item.title}
            </Typography>
            <Grid container spacing={2} style={{ display: "flex", flexWrap: "wrap" }}>
              {item.items.map((subItem, subIndex) => (
                <Grid item xs={6} lg={4} key={subIndex} style={{ display: "flex" }}>
                  <Card
                    sx={{
                      margin: "10px 0",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                      },
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                    onClick={() => navigate(subItem.path)}
                  >
                    <CardContent style={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        {item.title} #{subIndex + 1}
                      </Typography>
                      <Typography
                        style={{
                          fontSize: "20px",
                          marginBottom: "12px",
                          fontWeight: "600",
                          lineHeight: "1.2",
                        }}
                      >
                        {subItem.text}
                      </Typography>
                      <Divider />
                      <Typography
                        style={{ fontSize: "14px", lineHeight: "1.2", marginTop: "12px" }}
                        color="text.secondary"
                      >
                        {subItem.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
