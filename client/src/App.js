import React from "react";
import { Route, Routes, Outlet, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, ThemeProvider, createTheme } from "@mui/material";
import Navigation from "./component/Navigation";
import Home from "./pages/Home";
import TimeBased from "./pages/TrendAnalysis/TimeBased";
import ColorPatternBased from "./pages/TrendAnalysis/ColorPatternBased";
import SurroundingElementsBased from "./pages/TrendAnalysis/SurroundingElementsBased";
import Popularity from "./pages/TrendAnalysis/Popularity";
import RegionTrends from "./pages/TrendAnalysis/RegionTrend";
import GenerateTools from "./pages/CreativeTools/GenerateTools";
import EditTools from "./pages/CreativeTools/EditTools";

import "./App.css";

function Layout() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#4318FF",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "50px",
            padding: "8px 28px",
          },
        },
      },
    },
    typography: {
      fontFamily: "DM Sans, sans-serif",
      title: {
        fontSize: "30px",
        fontWeight: 800,
        textAlign: "center",
      },
      h4: {
        fontSize: "24px",
        fontWeight: 700,
        lineHeight: 1.5,
        color: "#2B3674",
      },
      h5: {
        fontSize: "20px",
        fontWeight: 700,
        lineHeight: 1.5,
        color: "#2B3674",
      },
      h6: {
        fontSize: "18px",
        fontWeight: 600,
        color: "#1B2559",
      },
      navigationTitle: {
        fontSize: "20px",
        fontWeight: 800,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box
          component="main"
          sx={{
            boxSizing: "border-box",
            flex: 1,
            bgcolor: "#F4F7FE",
            p: "56px",
            height: "100vh",
            overflowY: "scroll",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function Initialize() {
  const dispatch = useDispatch();
  const clearGeneratedImages = () => {
    dispatch({ type: "CLEAR_GENERATED_IMAGES" });
  };
  clearGeneratedImages();

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2>Initializing...</h2>
    </Box>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="trend-analysis/time" element={<TimeBased />} />
        <Route
          path="trend-analysis/surface-material/color-pattern"
          element={<ColorPatternBased />}
        />
        <Route
          path="trend-analysis/surface-material/surrounding-elements"
          element={<SurroundingElementsBased />}
        />
        <Route path="trend-analysis/popularity" element={<Popularity />} />
        <Route path="trend-analysis/region" element={<RegionTrends />} />
        <Route path="creative-tools/generate" element={<GenerateTools />} />
        <Route path="creative-tools/edit" element={<EditTools />} />
        <Route path="initialize" element={<Initialize />} />
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

export default App;
