import React, { useMemo } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Stack,
  Chip,
  Divider,
  Box,
  Skeleton,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  TrendingUp,
  Package,
  Users,
  CreditCard,
  LineChart,
  AlertCircle,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";

import Background from "../../components/Background.jsx";
import { getAllOrders } from "../../api/orders.js";
import { fetchBooks } from "../../api/books.js";

const fonts = {
  heading: '"Poppins", "Inter", sans-serif',
  body: '"Inter", "Host Grotesk", sans-serif',
  numeric: '"Host Grotesk", "Inter", sans-serif',
};

const surfaceSx = {
  p: { xs: 2, md: 3 },
  borderRadius: 3,
  background:
    "linear-gradient(165deg, rgba(15,23,42,0.92), rgba(15,23,42,0.78))",
  border: "1px solid rgba(148,163,184,0.18)",
  color: "#e2e8f0",
  boxShadow: "0 24px 48px -32px rgba(15,23,42,0.95)",
  backdropFilter: "blur(18px)",
  position: "relative",
  overflow: "hidden",
};

const statCardSx = {
  ...surfaceSx,
  height: "100%",
  minHeight: { xs: 148, md: 168 },
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const getIconWrapperSx = (accent) => ({
  width: 48,
  height: 48,
  borderRadius: "999px",
  background: `${accent}26`,
  color: accent,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

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

function StatCard({ icon, label, value, helper, accent }) {
  const Icon = icon;
  return (
    <Paper sx={statCardSx}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack spacing={0.5}>
          <Typography
            variant="body2"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "rgba(226,232,240,0.7)",
              fontFamily: fonts.body,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#f8fafc",
              fontFamily: fonts.numeric,
              fontSize: { xs: "1.85rem", md: "2.2rem" },
            }}
          >
            {value}
          </Typography>
          {helper && (
            <Typography
              variant="body2"
              sx={{ color: "rgba(226,232,240,0.72)", fontFamily: fonts.body }}
            >
              {helper}
            </Typography>
          )}
        </Stack>
        <Box sx={getIconWrapperSx(accent)}>
          <Icon size={24} />
        </Box>
      </Stack>
    </Paper>
  );
}

function QuickActionCard({ title, description, action, accent = "#f43f5e" }) {
  return (
    <Paper
      sx={{
        ...surfaceSx,
        minHeight: { xs: 140, md: 160 },
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Chip
        label="Priority"
        size="small"
        sx={{
          alignSelf: "flex-start",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: fonts.body,
          backgroundColor: `${accent}22`,
          color: accent,
          borderColor: `${accent}55`,
          border: "1px solid",
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: "#f8fafc",
          fontWeight: 700,
          fontFamily: fonts.heading,
          lineHeight: 1.35,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(226,232,240,0.72)", fontFamily: fonts.body }}
      >
        {description}
      </Typography>
      {action}
    </Paper>
  );
}

function RecentOrdersList({ orders, loading }) {
  if (loading) {
    return (
      <Stack spacing={2} mt={2}>
        {[...Array(3)].map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rounded"
            height={72}
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
        No recent orders. New purchases will appear here.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5} mt={2}>
      {orders.map((order) => {
        const style = statusPalette[order.status] || statusPalette.default;
        return (
          <Box
            key={order._id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(15,23,42,0.55)",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <Stack spacing={0.5}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: "#f8fafc",
                  fontFamily: fonts.heading,
                }}
              >
                #{order._id?.slice(-6) || order._id}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(226,232,240,0.7)", fontFamily: fonts.body }}
              >
                {order.user?.name || "Unknown customer"} ·{" "}
                {order.items?.length || 0} items
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(226,232,240,0.6)", fontFamily: fonts.body }}
              >
                {dayjs(order.createdAt).format("MMM D, YYYY • h:mm A")}
              </Typography>
            </Stack>
            <Stack spacing={1} alignItems="flex-end">
              <Chip
                label={order.status}
                size="small"
                sx={{
                  textTransform: "capitalize",
                  fontWeight: 600,
                  color: style.color,
                  borderColor: style.border,
                  backgroundColor: style.bg,
                  px: 0.75,
                }}
                variant="outlined"
              />
              <Typography
                variant="body1"
                sx={{
                  color: "#f8fafc",
                  fontWeight: 600,
                  fontFamily: fonts.numeric,
                }}
              >
                {formatCurrency(order.total)}
              </Typography>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

function InventoryHighlights({ books, loading }) {
  if (loading) {
    return (
      <Grid container spacing={2} mt={1}>
        {[...Array(3)].map((_, idx) => (
          <Grid item xs={12} sm={6} key={idx}>
            <Skeleton
              variant="rounded"
              height={88}
              animation="wave"
              sx={{
                backgroundColor: "rgba(148,163,184,0.16)",
                borderRadius: 2,
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!books.length) {
    return (
      <Typography
        variant="body2"
        sx={{ mt: 2, color: "rgba(226,232,240,0.7)" }}
      >
        Inventory looks healthy. Low-stock titles will surface here.
      </Typography>
    );
  }

  return (
    <Grid container spacing={2.5} mt={1}>
      {books.map((book) => (
        <Grid item xs={12} sm={6} key={book._id}>
          <Paper
            sx={{
              ...surfaceSx,
              p: { xs: 1.75, md: 2 },
              display: "flex",
              flexDirection: "row",
              gap: 1.5,
              alignItems: "flex-start",
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 96,
                borderRadius: 2,
                overflow: "hidden",
                flexShrink: 0,
                boxShadow: "0 16px 30px -24px rgba(15,23,42,0.85)",
                border: "1px solid rgba(148,163,184,0.22)",
              }}
            >
              <img
                src={book.coverUrl || "/placeholder.svg"}
                alt={book.title}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
            <Stack spacing={0.75} sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: "#f8fafc",
                  fontFamily: fonts.heading,
                }}
              >
                {book.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(226,232,240,0.72)", fontFamily: fonts.body }}
              >
                Stock on hand: {book.stock ?? "—"} · Category:{" "}
                {book.category || "General"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#f8fafc", fontFamily: fonts.numeric }}
              >
                {formatCurrency(book.price_npr)}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default function AdminDashboard() {
  const ordersQuery = useQuery({
    queryKey: ["dashboard", "adminOrders"],
    queryFn: () => getAllOrders(),
  });

  const booksQuery = useQuery({
    queryKey: ["dashboard", "adminBooks"],
    queryFn: () => fetchBooks({ limit: 12 }),
  });

  const orders = useMemo(() => ordersQuery.data || [], [ordersQuery.data]);
  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );
  const inProgressOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["pending", "processing", "shipping", "paid"].includes(order.status)
      ).length,
    [orders]
  );
  const completedOrders = useMemo(
    () =>
      orders.filter((order) => ["completed", "shipped"].includes(order.status))
        .length,
    [orders]
  );
  const uniqueCustomers = useMemo(() => {
    const ids = new Set(
      orders
        .map((order) => {
          if (!order.user) return undefined;
          if (typeof order.user === "string") return order.user;
          return order.user?._id;
        })
        .filter(Boolean)
    );
    return ids.size;
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      orders
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [orders]
  );

  const lowStockBooks = useMemo(() => {
    const items = booksQuery.data?.items || [];
    const lowStock = items.filter(
      (book) => typeof book.stock === "number" && book.stock <= 8
    );
    return (lowStock.length ? lowStock : items).slice(0, 4);
  }, [booksQuery.data]);

  const topTicketOrders = useMemo(() => {
    return orders
      .slice()
      .sort((a, b) => Number(b.total || 0) - Number(a.total || 0))
      .slice(0, 3);
  }, [orders]);

  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  const statCards = [
    {
      icon: TrendingUp,
      label: "Total revenue",
      value: formatCurrency(totalRevenue),
      helper: `${orders.length} orders processed`,
      accent: "#f43f5e",
    },
    {
      icon: Package,
      label: "Active fulfilment",
      value: inProgressOrders,
      helper: "Awaiting processing or shipment",
      accent: "#38bdf8",
    },
    {
      icon: Users,
      label: "Customers",
      value: uniqueCustomers,
      helper: "Unique shoppers served",
      accent: "#a855f7",
    },
    {
      icon: CreditCard,
      label: "Avg. order value",
      value: formatCurrency(avgOrderValue),
      helper: completedOrders
        ? `${completedOrders} completed`
        : "Complete first order",
      accent: "#facc15",
    },
  ];

  return (
    <Container
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      sx={{ py: { xs: 4, md: 6 }, px: { xs: 1.5, sm: 2 } }}
      maxWidth="xl"
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
                fontSize: { xs: "2rem", md: "2.35rem" },
              }}
            >
              Store overview
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(226,232,240,0.75)",
                fontFamily: fonts.body,
                maxWidth: 640,
              }}
            >
              Track operations at a glance. Dive deeper into orders, inventory,
              and customer health in real time.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                component="a"
                href="/admin/orders"
                variant="contained"
                sx={{
                  backgroundColor: "#f43f5e",
                  color: "#0f172a",
                  fontWeight: 700,
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontFamily: fonts.heading,
                  "&:hover": { backgroundColor: "#fb7185" },
                }}
                startIcon={<ArrowUpRight size={18} />}
              >
                Go to orders
              </Button>
              <Button
                component="a"
                href="/admin/books"
                variant="outlined"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontFamily: fonts.body,
                  borderRadius: 2,
                  color: "#f8fafc",
                  borderColor: "rgba(248,113,113,0.55)",
                  "&:hover": {
                    borderColor: "#f43f5e",
                    backgroundColor: "rgba(248,113,113,0.08)",
                  },
                }}
              >
                Manage titles
              </Button>
            </Stack>
          </Paper>

          <Box
            sx={{
              display: "grid",
              gap: { xs: 2, md: 2.5 },
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: { xs: 2, md: 2.5 },
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            <Paper sx={surfaceSx}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LineChart size={18} color="#38bdf8" />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#f8fafc",
                    fontFamily: fonts.heading,
                  }}
                >
                  Top ticket orders
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{ color: "rgba(226,232,240,0.7)", fontFamily: fonts.body }}
              >
                Highest value purchases over the last period.
              </Typography>
              <RecentOrdersList
                orders={topTicketOrders}
                loading={ordersQuery.isLoading}
              />
            </Paper>
            <Paper sx={surfaceSx}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AlertCircle size={18} color="#facc15" />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#f8fafc",
                    fontFamily: fonts.heading,
                  }}
                >
                  Inventory spotlight
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{ color: "rgba(226,232,240,0.7)", fontFamily: fonts.body }}
              >
                Watch titles trending toward low stock and adjust replenishment.
              </Typography>
              <InventoryHighlights
                books={lowStockBooks}
                loading={booksQuery.isLoading}
              />
            </Paper>
          </Box>

          <Paper sx={surfaceSx}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ShoppingBag size={18} color="#4ade80" />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#f8fafc",
                  fontFamily: fonts.heading,
                }}
              >
                Fresh activity
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              sx={{ color: "rgba(226,232,240,0.7)", fontFamily: fonts.body }}
            >
              A quick pulse of recent orders to keep you informed.
            </Typography>
            <RecentOrdersList
              orders={recentOrders}
              loading={ordersQuery.isLoading}
            />
          </Paper>

          <Box
            sx={{
              display: "grid",
              gap: { xs: 2, md: 2.5 },
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
            }}
          >
            <QuickActionCard
              title="Review pending fulfilment"
              description="Check processing and shipping orders to ensure SLAs stay on track."
              accent="#38bdf8"
              action={
                <Button
                  component="a"
                  href="/admin/orders"
                  variant="text"
                  sx={{
                    alignSelf: "flex-start",
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: fonts.body,
                    color: "#f8fafc",
                    px: 0,
                  }}
                >
                  Inspect orders →
                </Button>
              }
            />
            <QuickActionCard
              title="Refresh catalogue listings"
              description="Update descriptions, pricing, and merchandising for top performers."
              accent="#a855f7"
              action={
                <Button
                  component="a"
                  href="/admin/books"
                  variant="text"
                  sx={{
                    alignSelf: "flex-start",
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: fonts.body,
                    color: "#f8fafc",
                    px: 0,
                  }}
                >
                  Manage catalogue →
                </Button>
              }
            />
            <QuickActionCard
              title="Add a new title"
              description="Keep the shelves fresh by introducing a new release or bestseller."
              accent="#f43f5e"
              action={
                <Button
                  component="a"
                  href="/admin/books/new"
                  variant="text"
                  sx={{
                    alignSelf: "flex-start",
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: fonts.body,
                    color: "#f8fafc",
                    px: 0,
                  }}
                >
                  Add book →
                </Button>
              }
            />
          </Box>
        </Stack>
      </div>
    </Container>
  );
}
