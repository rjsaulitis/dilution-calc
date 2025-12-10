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
import { TestTube, Wine, X } from "phosphor-react";
import { BottleWine, SquareX, TestTubeDiagonal, WineIcon } from "lucide-react";

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
        minHeight: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 0,
      }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 600,
          height: isMobile ? "100vh" : "auto",
          borderRadius: isMobile ? 0 : 3,
          boxShadow: isMobile ? "none" : "0 4px 20px rgba(0,0,0,0.05)",
          width: "100%",
        }}
      >
        <Stack spacing={3} sx={{ px: isMobile ? 2 : 0 }}>
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
              onClick={() => setHelperVisible(false)}
            >
              <Typography variant="body2" sx={{ color: "#333" }}>
                New strength % is always relative to pure raw material (100%).
                Click this message to close it.
              </Typography>
              {/* <IconButton
                size="small"
                
                sx={{ position: "absolute", top: 4, right: 4 }}
              >
                <SquareX size={20} weight="bold" color="#176c55ff" />
              </IconButton> */}
            </Box>
          )}

          {/* Inputs */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Current Strength (%)"
              value={existing}
              onChange={(e) => setExisting(e.target.value)}
              type="number" // still needed for validation & stepper
              pattern="[0-9]*"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused": {
                  "& fieldset": { borderColor: "#333" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#333" },
              }}
            />
            <TextField
              label="New Strength (%)"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              type="number" // still needed for validation & stepper
              pattern="[0-9]*"
              fullWidth
              error={Number(target) > Number(existing)}
              helperText={
                Number(target) > Number(existing)
                  ? "Must be less than Current %"
                  : ""
              }
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused": {
                  "& fieldset": { borderColor: "#333" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#333" },
              }}
            />

            <TextField
              label="Total Amount (ml)"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              type="number" // still needed for validation & stepper
              inputMode="decimal" // tells mobile to show numeric keyboard
              pattern="[0-9]*"
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
              <Stack
                direction={"row"}
                justifyContent={"Center"}
                alignItems={"center"}
                sx={{ pb: 1 }}
              >
                <Typography variant="subtitle1" sx={{ pr: 1 }}>
                  Material Needed
                </Typography>
                <TestTubeDiagonal size={20} />
              </Stack>
              <Typography sx={{ fontWeight: "normal" }} variant="h4">
                {materialNeeded} g
              </Typography>
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
              <Stack
                direction={"row"}
                justifyContent={"Center"}
                alignItems={"center"}
                sx={{ pb: 1 }}
              >
                <Typography variant="subtitle1" sx={{ pr: 0.6 }}>
                  Solvent Needed
                </Typography>
                <BottleWine size={20} />
              </Stack>
              <Typography sx={{ fontWeight: "normal" }} variant="h4">
                {solventNeeded} g
              </Typography>
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
      {!isMobile && (
        <Typography
          variant="caption"
          sx={{ mt: 2, textAlign: "center", cursor: "pointer", color: "#555" }}
          onClick={() =>
            window.open("https://www.youtube.com/@perfumerinajar", "_blank")
          }
        >
          Brought to you by @perfumerinajar
        </Typography>
      )}
    </Box>
  );
}
