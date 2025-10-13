import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";

const baseSx = {
  justifyContent: "flex-start",
  textTransform: "none",
  borderRadius: 2,
  fontWeight: 600,
  px: { xs: 2, md: 2.5 },
  py: { xs: 1.75, md: 2 },
  alignItems: "flex-start",
  width: "100%",
  gap: 0.75,
};

const variants = {
  contained: {
    backgroundColor: "#f43f5e",
    color: "#0f172a",
    "&:hover": { backgroundColor: "#fb7185" },
  },
  outlined: {
    border: "1px solid rgba(248,113,113,0.55)",
    color: "#f8fafc",
    backgroundColor: "transparent",
    "&:hover": {
      borderColor: "#f43f5e",
      backgroundColor: "rgba(248,113,113,0.08)",
    },
  },
  soft: {
    backgroundColor: "rgba(148,163,184,0.12)",
    color: "#f8fafc",
    "&:hover": { backgroundColor: "rgba(148,163,184,0.2)" },
  },
};

function QuickActionButton({ action, fonts }) {
  const { to, label, description, variant = "contained" } = action;
  return (
    <Button
      component={Link}
      to={to}
      variant="text"
      sx={{ ...baseSx, ...variants[variant] }}
    >
      <Stack spacing={0.5} alignItems="flex-start" sx={{ width: "100%" }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            color: "inherit",
            fontFamily: fonts.heading,
            fontSize: { xs: "1rem", md: "1.05rem" },
          }}
        >
          {label}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            sx={{
              color: "inherit",
              opacity: 0.8,
              fontFamily: fonts.body,
              lineHeight: 1.5,
            }}
          >
            {description}
          </Typography>
        )}
      </Stack>
    </Button>
  );
}

export default function QuickActionsList({ actions, fonts }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: { xs: 1, sm: 1.25, md: 1.5 },
        gridTemplateColumns: {
          xs: "repeat(1, minmax(0, 1fr))",
          sm: "repeat(2, minmax(0, 1fr))",
        },
      }}
    >
      {actions.map((action) => (
        <QuickActionButton key={action.label} action={action} fonts={fonts} />
      ))}
    </Box>
  );
}
