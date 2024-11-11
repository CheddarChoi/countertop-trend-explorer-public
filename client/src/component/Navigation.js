import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Drawer, List, ListItem, Typography, Box } from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import GestureIcon from "@mui/icons-material/Gesture";

const drawerWidth = 260;

const navigationItems = [
  {
    title: "Trend Analysis",
    icon: WhatshotIcon,
    items: [
      { text: "표면소재 트렌드 변화", path: "/trend-analysis/time" },
      {
        text: "표면소재 트렌드 분석",
        subItems: [
          { text: "컬러/패턴별", path: "/trend-analysis/surface-material/color-pattern" },
          { text: "주변요소별", path: "/trend-analysis/surface-material/surrounding-elements" },
        ],
      },
      { text: "표면소재 컬러/패턴 인기순위", path: "/trend-analysis/popularity" },
      { text: "지역별 트렌드", path: "/trend-analysis/region" },
    ],
  },
  {
    title: "Creative Tools",
    icon: GestureIcon,
    items: [
      { text: "표면소재 디자인 생성하기", path: "/creative-tools/generate" },
      { text: "표면소재 디자인 편집하기", path: "/creative-tools/edit" },
    ],
  },
];

const selectedStyle = {
  backgroundColor: "#F4F7FE !important",
  fontWeight: "bold",
  position: "relative",
};

const indicatorStyle = {
  content: '""',
  position: "absolute",
  height: "100%",
  width: "5px",
  backgroundColor: "#673AB7",
  top: 0,
  right: 0,
};

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          padding: "0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      }}
    >
      <div>
        <Typography variant="title" component="div" style={{ padding: "56px 0" }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Countertop <br /> Trend Explorer
          </Link>
        </Typography>

        <div style={{ paddingLeft: "10px" }}>
          {navigationItems.map((navItem, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ p: "12px 0" }}>
                <navItem.icon style={{ marginRight: "10px" }} />
                <Typography fontWeight="bold">{navItem.title}</Typography>
              </ListItem>
              {navItem.items.map((item, subIndex) => (
                <React.Fragment key={subIndex}>
                  {item.subItems ? (
                    <>
                      <ListItem
                        button
                        onClick={() => navigate(item.subItems[0].path)}
                        selected={location.pathname.startsWith("/trend-analysis/surface-material")}
                        sx={
                          location.pathname.startsWith("/trend-analysis/surface-material")
                            ? selectedStyle
                            : {}
                        }
                        style={{ padding: "12px 0 12px 36px" }}
                      >
                        {item.text}
                        {location.pathname.startsWith("/trend-analysis/surface-material") && (
                          <Box sx={indicatorStyle} />
                        )}
                      </ListItem>
                      <List component="div" disablePadding style={{ paddingLeft: "36px" }}>
                        {item.subItems.map((subItem, subSubIndex) => (
                          <ListItem
                            button
                            component={Link}
                            to={subItem.path}
                            selected={location.pathname === subItem.path}
                            sx={location.pathname === subItem.path ? selectedStyle : {}}
                            key={subSubIndex}
                            style={{ padding: "12px 0 12px 36px" }}
                          >
                            {location.pathname === subItem.path && <Box sx={indicatorStyle} />}
                            {subItem.text}
                          </ListItem>
                        ))}
                      </List>
                    </>
                  ) : (
                    <ListItem
                      button
                      component={Link}
                      to={item.path}
                      selected={location.pathname === item.path}
                      sx={location.pathname === item.path ? selectedStyle : {}}
                      style={{ padding: "12px 0 12px 36px" }}
                    >
                      {location.pathname === item.path && <Box sx={indicatorStyle} />}
                      {item.text}
                    </ListItem>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default Navigation;
