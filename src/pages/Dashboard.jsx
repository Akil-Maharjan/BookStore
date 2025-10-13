import React, { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Skeleton,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ShoppingCart, CheckCircle2, CreditCard, BookOpen } from "lucide-react";

import { useAuth } from "../store/auth.js";
import Background from "../components/Background.jsx";
import StatsGrid from "../components/dashboard/StatsGrid.jsx";
import RecommendationGrid from "../components/dashboard/RecommendationGrid.jsx";
import QuickActionsList from "../components/dashboard/QuickActionsList.jsx";
import { getMyOrders } from "../api/orders.js";
import { getCart } from "../api/cart.js";
import { fetchBooks } from "../api/books.js";

const fonts = {
  heading: '"Poppins", "Inter", sans-serif',
  body: '"Inter", "Host Grotesk", sans-serif',
  numeric: '"Host Grotesk", "Inter", sans-serif',
};

const surfaceSx = {
  p: { xs: 2.25, md: 3 },
  borderRadius: 3,
  background:
    "linear-gradient(165deg, rgba(15,23,42,0.9), rgba(15,23,42,0.75))",
  border: "1px solid rgba(148,163,184,0.18)",
  color: "#e2e8f0",
  boxShadow: "0 24px 48px -32px rgba(15,23,42,0.95)",
  backdropFilter: "blur(18px)",
};

const statusPalette = {
  pending: {
    bg: "rgba(250,204,21,0.12)",
    border: "rgba(250,204,21,0.5)",
    color: "#facc15",
  },
  processing: {
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.5)",
    color: "#93c5fd",
  },
  shipping: {
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.5)",
    color: "#93c5fd",
  },
  paid: {
    bg: "rgba(14,165,233,0.12)",
    border: "rgba(14,165,233,0.5)",
    color: "#38bdf8",
  },
  completed: {
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.5)",
    color: "#4ade80",
  },
  shipped: {
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.5)",
    color: "#4ade80",
  },
  cancelled: {
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.5)",
    color: "#fca5a5",
  },
  failed: {
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.5)",
    color: "#fca5a5",
  },
  default: {
    bg: "rgba(148,163,184,0.12)",
    border: "rgba(148,163,184,0.4)",
    color: "#cbd5f5",
  },
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const statusStyles = (status) => statusPalette[status] || statusPalette.default;

function QuickAction({ to, label, description, variant = "contained" }) {
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

function RecentOrders({ orders, loading }) {
  if (loading) {
    return (
      <Stack spacing={2} mt={2}>
        {[...Array(3)].map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rounded"
            height={68}
            animation="wave"
            sx={{ backgroundColor: "rgba(148,163,184,0.16)" }}
          />
        ))}
      </Stack>
    );
  }

  if (!orders.length) {
    return (
      <Typography
        variant="body2"
        sx={{ mt: 2, color: "rgba(226,232,240,0.7)" }}
      >
        No recent orders yet. Once you place an order, you will see it here.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5} mt={2}>
      {orders.slice(0, 5).map((order) => {
        const style = statusStyles(order.status);
        return (
          <Box
            key={order._id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(148,163,184,0.2)",
              background: "rgba(15,23,42,0.55)",
              transition: "border-color 0.2s ease, transform 0.2s ease",
              "&:hover": {
                borderColor: "rgba(248,113,113,0.5)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
              rowGap={1.5}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#f8fafc",
                    fontFamily: fonts.heading,
                  }}
                >
                  #{order._id?.slice(-6) || order._id}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(226,232,240,0.65)",
                    fontFamily: fonts.body,
                  }}
                >
                  {order.createdAt
                    ? dayjs(order.createdAt).format("MMM D, YYYY • h:mm A")
                    : "—"}
                </Typography>
              </Box>
              <Stack spacing={0.5} alignItems="flex-end">
                <Chip
                  label={order.status}
                  size="small"
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: 600,
                    px: 0.75,
                    color: style.color,
                    borderColor: style.border,
                    backgroundColor: style.bg,
                  }}
                  variant="outlined"
                />
                <Typography
                  variant="body2"
                  sx={{ color: "#f8fafc", fontWeight: 600 }}
                >
                  {formatCurrency(order.total)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

export default function Dashboard() {
  const { user, isAdmin, loading } = useAuth();

  const ordersQuery = useQuery({
    queryKey: ["dashboard", "orders"],
    queryFn: () => getMyOrders(),
    enabled: !loading,
  });

  const cartQuery = useQuery({
    queryKey: ["dashboard", "cart"],
    queryFn: () => getCart(),
    enabled: !loading,
  });

  const booksQuery = useQuery({
    queryKey: ["dashboard", "books"],
    queryFn: () => fetchBooks({ limit: 8 }),
    enabled: !loading,
  });

  const orders = useMemo(() => ordersQuery.data || [], [ordersQuery.data]);
  const recentOrders = useMemo(
    () =>
      orders
        .slice()
        .sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        ),
    [orders]
  );

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "completed").length,
    [orders]
  );

  const inProgressOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["pending", "processing", "shipping", "paid"].includes(order.status)
      ).length,
    [orders]
  );

  const cartItems = useMemo(() => {
    const items = cartQuery.data?.items || [];
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [cartQuery.data]);

  const statCards = useMemo(
    () => [
      {
        icon: ShoppingCart,
        label: "Orders placed",
        value: orders.length,
        helper: `${inProgressOrders} in progress`,
        accent: "#38bdf8",
      },
      {
        icon: CheckCircle2,
        label: "Completed orders",
        value: completedOrders,
        helper: completedOrders ? "Nicely done! 🎉" : "Finish your first order",
        accent: "#4ade80",
      },
      {
        icon: CreditCard,
        label: "Total spent",
        value: formatCurrency(totalSpent),
        helper: "Across all purchases",
        accent: "#facc15",
      },
      {
        icon: BookOpen,
        label: "Items in cart",
        value: cartItems,
        helper: cartItems ? "Ready for checkout" : "Your cart is empty",
        accent: "#f43f5e",
      },
    ],
    [orders.length, inProgressOrders, completedOrders, totalSpent, cartItems]
  );

  const quickActions = useMemo(
    () => [
      {
        to: "/books",
        label: "Browse books",
        description: "Discover new releases and bestsellers",
        variant: "contained",
      },
      {
        to: "/cart",
        label: "Go to cart",
        description: cartItems
          ? `${cartItems} item${cartItems === 1 ? "" : "s"} waiting`
          : "Your cart is currently empty",
        variant: "outlined",
      },
      {
        to: "/orders",
        label: "Track orders",
        description: "Check delivery status and receipts",
        variant: "soft",
      },
      {
        to: "/dashboard#account",
        label: "Manage profile",
        description: "Update address, preferences, and security",
        variant: "soft",
      },
    ],
    [cartItems]
  );

  const recommendedBooks = useMemo(() => {
    const items = booksQuery.data?.items || [];
    return items.slice(0, 4);
  }, [booksQuery.data]);

  if (loading) return null;
  if (isAdmin()) return <Navigate to="/admin/dashboard" replace />;

  return (
    <Container
      component={motion.div}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      maxWidth={false}
      sx={{
        py: { xs: 4, md: 6 },
        px: { xs: 1.5, sm: 2.5, md: 3 },
        maxWidth: 1550,
        mx: "auto",
        width: "100%",
      }}
    >
      <Background />
      <div className="relative z-10">
        <Stack spacing={4}>
          <Paper
            sx={{
              ...surfaceSx,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "#f8fafc",
                fontWeight: 700,
                fontFamily: fonts.heading,
                fontSize: { xs: "2rem", md: "2.25rem" },
              }}
            >
              Welcome{user ? `, ${user.name}` : ""}!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(226,232,240,0.75)",
                fontFamily: fonts.body,
                maxWidth: 600,
              }}
            >
              Here is a snapshot of your reading journey and recent activity.
            </Typography>
            <Button
              component={Link}
              to="/books"
              variant="contained"
              sx={{
                alignSelf: "flex-start",
                mt: 1,
                backgroundColor: "#f43f5e",
                color: "#0f172a",
                fontWeight: 700,
                textTransform: "none",
                px: 3,
                py: 1.5,
                borderRadius: 2,
                "&:hover": { backgroundColor: "#fb7185" },
              }}
            >
              Discover books
            </Button>
          </Paper>

          <StatsGrid cards={statCards} fonts={fonts} surfaceSx={surfaceSx} />

          <Paper sx={{ ...surfaceSx, p: { xs: 1, sm: 1.5, md: 2 } }}>
            <QuickActionsList actions={quickActions} fonts={fonts} />
          </Paper>

          <Box
            sx={{
              display: "grid",
              gap: { xs: 2, md: 2.5 },
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                md: "1.6fr 1fr",
              },
              alignItems: "stretch",
            }}
          >
            <Paper sx={surfaceSx}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#f8fafc",
                  fontFamily: fonts.heading,
                }}
              >
                Recommended for you
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(226,232,240,0.7)", fontFamily: fonts.body }}
              >
                Based on popular picks and recent arrivals.
              </Typography>
              <RecommendationGrid
                books={recommendedBooks}
                loading={booksQuery.isLoading}
                fonts={fonts}
                formatCurrency={formatCurrency}
                limit={3}
              />
              <Button
                component={Link}
                to="/books"
                variant="text"
                sx={{
                  mt: 2,
                  alignSelf: "flex-start",
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#f8fafc",
                  px: 0,
                  fontFamily: fonts.body,
                }}
              >
                Browse catalogue →
              </Button>
            </Paper>

            <Paper sx={surfaceSx}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#f8fafc",
                  fontFamily: fonts.heading,
                }}
              >
                Recent orders
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(226,232,240,0.7)", fontFamily: fonts.body }}
              >
                Your most recent purchases and their status.
              </Typography>
              <RecentOrders
                orders={recentOrders}
                loading={ordersQuery.isLoading}
              />
              {orders.length > 0 && (
                <Button
                  component={Link}
                  to="/orders"
                  variant="text"
                  sx={{
                    mt: 2,
                    alignSelf: "flex-start",
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#f8fafc",
                    px: 0,
                    fontFamily: fonts.body,
                  }}
                >
                  View all orders →
                </Button>
              )}
            </Paper>
          </Box>
        </Stack>
      </div>
    </Container>
  );
}
