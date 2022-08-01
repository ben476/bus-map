import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import React from "react";

export default function Home() {
  return (
    <Fade in>
      <Box>
        <Box sx={{ padding: 3 }}>
          <Box
            sx={{
              paddingInline: 1,
              paddingBlock: 3,
              marginTop: 7,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
              }}
            >
              Live bus map
            </Typography>
            <Typography
              variant="h6"
              sx={{
                marginTop: 2,
                fontWeight: 400,
                lineHeight: "1.4em",
              }}
            >
              A map of bus stops and live bus locations from the Metlink API
            </Typography>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
}
