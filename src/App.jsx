import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Paper,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import { X } from "phosphor-react";

const presetsRaw = [50, 20, 10, 1];
const presetsDilute = [
  { from: 50, to: 20 },
  { from: 20, to: 10 },
  { from: 10, to: 1 },
];

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mode, setMode] = useState("dilute"); // 'raw' or 'dilute'
  const [material, setMaterial] = useState("");
  const [existing, setExisting] = useState("");
  const [target, setTarget] = useState("");
  const [volume, setVolume] = useState("");
  const [materialNeeded, setMaterialNeeded] = useState(0);
  const [solventNeeded, setSolventNeeded] = useState(0);
  const [helperVisible, setHelperVisible] = useState(true);

  // Load saved values from localStorage on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem("volume");
    const savedMaterial = localStorage.getItem("material");
    const savedExisting = localStorage.getItem("existing");
    const savedTarget = localStorage.getItem("target");
    const savedHelper = localStorage.getItem("helperVisible");

    if (savedVolume) setVolume(savedVolume);
    if (savedMaterial) setMaterial(savedMaterial);
    if (savedExisting) setExisting(savedExisting);
    if (savedTarget) setTarget(savedTarget);
    if (savedHelper !== null) setHelperVisible(savedHelper === "true");
  }, []);

  // Save values to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("volume", volume);
    if (mode === "raw") {
      localStorage.setItem("material", material);
    } else {
      localStorage.setItem("existing", existing);
    }
    localStorage.setItem("target", target);
    localStorage.setItem("helperVisible", helperVisible);
  }, [volume, material, existing, target, mode, helperVisible]);

  // calculation
  useEffect(() => {
    const vol = parseFloat(volume);
    const tgt = parseFloat(target);
    const exist = parseFloat(existing) || 100;

    if (!vol || !tgt) {
      setMaterialNeeded(0);
      setSolventNeeded(0);
      return;
    }

    let mat = 0;
    if (mode === "raw") {
      mat = (tgt / 100) * vol;
    } else {
      mat = (tgt / exist) * vol;
    }
    setMaterialNeeded(mat.toFixed(2));
    setSolventNeeded((vol - mat).toFixed(2));
  }, [mode, target, volume, existing]);

  // percentages for visualizer
  const matPercent =
    volume && materialNeeded
      ? Math.min((materialNeeded / volume) * 100, 100)
      : 0;
  const solPercent = 100 - matPercent;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: 600,
          width: "100%",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <Stack spacing={3}>
          {/* Helper text */}
          {helperVisible && (
            <Box
              sx={{
                position: "relative",
                bgcolor: "#e0f7f5",
                p: 2,
                borderRadius: 2,
                border: "1px solid #36c8b5ff",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: "#333" }}>
                Target % is always relative to pure raw material (100%). Enter
                your bottle’s current concentration to calculate the grams
                needed for the chosen target %.
              </Typography>
              <IconButton
                size="small"
                onClick={() => setHelperVisible(false)}
                sx={{ position: "absolute", top: 4, right: 4 }}
              >
                <X size={20} weight="bold" />
              </IconButton>
            </Box>
          )}

          {/* Inputs */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Current Concentration %"
              value={mode === "raw" ? material : existing}
              onChange={(e) =>
                mode === "raw"
                  ? setMaterial(e.target.value)
                  : setExisting(e.target.value)
              }
              type="number"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused": {
                  "& fieldset": { borderColor: "#333" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#333" },
              }}
            />
            <TextField
              label="Target %"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              type="number"
              fullWidth
              error={target > material}
              helperText={target > material ? "Target exceeds current %" : ""}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused": {
                  "& fieldset": { borderColor: "#333" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#333" },
              }}
            />

            <TextField
              label="Final volume (ml)"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              type="number"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused": {
                  "& fieldset": { borderColor: "#333" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#333" },
              }}
            />
          </Stack>

          {/* Results */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box
              sx={{
                flex: 1,
                p: 3,
                border: "1px solid #ccc",
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                {mode === "raw"
                  ? "Raw Material Needed"
                  : "Existing Dilution Needed"}
              </Typography>
              <Typography variant="h4">{materialNeeded} g</Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 3,
                border: "1px solid #ccc",
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Solvent Needed
              </Typography>
              <Typography variant="h4">{solventNeeded} g</Typography>
            </Box>
          </Stack>

          {/* Visualizer */}
          {!isMobile && (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  height: 20,
                  borderRadius: 2,
                  overflow: "hidden",
                  display: "flex",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Box
                  sx={{
                    width: `${matPercent}%`,
                    bgcolor: "#36c8b5ff",
                    backgroundImage:
                      "repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 5px, transparent 5px, transparent 10px)",
                    transition:
                      "width 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                  }}
                />
                <Box
                  sx={{
                    width: `${solPercent}%`,
                    bgcolor: "#565656ff",
                    transition:
                      "width 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                  }}
                />
              </Box>

              {/* Legend */}
              <Stack direction="row" spacing={2} mt={1} justifyContent="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: "#36c8b5ff",
                      backgroundImage:
                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 5px, transparent 5px, transparent 10px)",
                      borderRadius: 2,
                    }}
                  />
                  <Typography variant="body2">Material</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: "#565656ff",
                      borderRadius: 2,
                    }}
                  />
                  <Typography variant="body2">Solvent</Typography>
                </Stack>
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Attribution */}
      <Typography
        variant="caption"
        sx={{ mt: 2, textAlign: "center", cursor: "pointer", color: "#555" }}
        onClick={() =>
          window.open("https://www.youtube.com/@perfumerinajar", "_blank")
        }
      >
        Brought to you by @perfumerinajar
      </Typography>
    </Box>
  );
}
