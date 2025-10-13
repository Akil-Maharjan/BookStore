import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Typography,
  Paper,
  Stack,
  Box,
  Chip,
  Button,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  TextField,
  TablePagination,
  Avatar,
} from "@mui/material";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import Background from "../components/Background.jsx";
import { getMyOrders, updateOrderStatus, deleteOrder } from "../api/orders.js";
import { confirmToast } from "../utils/confirmToast.jsx";
import OrderDetailDialog from "../components/OrderDetailDialog.jsx";

const TOAST_DURATION = 2000;

const palette = {
  primaryText: "rgba(226,232,255,0.92)",
  secondaryText: "rgba(148,163,209,0.75)",
  headerText: "rgba(226,232,255,0.88)",
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const statusChipStyles = (status) => {
  switch (status) {
    case "pending":
    case "processing":
    case "shipping":
      return {
        color: "#ffffff",
        bgcolor: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.35)",
      };
    case "completed":
    case "shipped":
      return {
        color: "#bbf7d0",
        bgcolor: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(74,222,128,0.28)",
      };
    case "failed":
    case "cancelled":
      return {
        color: "#fecaca",
        bgcolor: "rgba(248,113,113,0.12)",
        border: "1px solid rgba(248,113,113,0.28)",
      };
    default:
      return {
        color: palette.primaryText,
        bgcolor: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.16)",
      };
  }
};

const statusColor = (status) => {
  switch (status) {
    case "processing":
    case "shipping":
      return "info";
    case "completed":
    case "shipped":
      return "success";
    case "failed":
    case "cancelled":
      return "error";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

const statusDescription = {
  pending: "Awaiting payment confirmation.",
  processing: "Order received. We are preparing the package.",
  shipping: "Payment confirmed. Your order is being shipped.",
  shipped: "Order shipped. Delivery on the way.",
  completed: "Order completed. Thank you!",
  failed: "Payment failed. Please retry.",
  cancelled: "Order cancelled.",
};

export default function Orders() {
  const qc = useQueryClient();
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders", { scope: "mine" }],
    queryFn: () => getMyOrders(),
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to load orders", {
        duration: TOAST_DURATION,
      });
    },
  });

  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const tableScrollRef = useRef(null);

  const closeDetailDialog = () => {
    setDetailOpen(false);
    setSelectedOrder(null);
  };

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success("Order updated", { duration: TOAST_DURATION });
      qc.invalidateQueries({ queryKey: ["orders", { scope: "mine" }] });
      qc.invalidateQueries({ queryKey: ["orders", { scope: "admin" }] });
      closeDetailDialog();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update order", {
        duration: TOAST_DURATION,
      });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteOrder(id),
    onSuccess: () => {
      toast.success("Order removed", { duration: TOAST_DURATION });
      qc.invalidateQueries({ queryKey: ["orders", { scope: "mine" }] });
      qc.invalidateQueries({ queryKey: ["orders", { scope: "admin" }] });
      closeDetailDialog();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete order", {
        duration: TOAST_DURATION,
      });
    },
  });

  const renderOrderActions = (order) => {
    const canComplete = ["shipping", "shipped"].includes(order.status);
    const canCancel = ["pending", "processing", "paid"].includes(order.status);
    const canDelete = ["cancelled", "failed", "completed"].includes(
      order.status
    );

    const actions = [];

    if (canCancel) {
      actions.push(
        <Button
          key="cancel"
          variant="outlined"
          size="small"
          color="warning"
          disabled={statusMut.isPending}
          onClick={async () => {
            const ok = await confirmToast({ message: "Cancel this order?" });
            if (ok) {
              statusMut.mutate({ id: order._id, status: "cancelled" });
            }
          }}
        >
          Cancel Order
        </Button>
      );
    }

    if (canComplete) {
      actions.push(
        <Button
          key="complete"
          variant="contained"
          size="small"
          disabled={statusMut.isPending}
          onClick={() =>
            statusMut.mutate({ id: order._id, status: "completed" })
          }
        >
          Mark as Received
        </Button>
      );
    }

    if (canDelete) {
      actions.push(
        <Tooltip key="delete" title="Remove this order from your history">
          <span>
            <Button
              variant="text"
              size="small"
              color="error"
              disabled={deleteMut.isPending}
              onClick={async () => {
                const ok = await confirmToast({
                  message: "Remove this order from history?",
                });
                if (ok) {
                  deleteMut.mutate(order._id);
                }
              }}
            >
              Delete Order
            </Button>
          </span>
        </Tooltip>
      );
    }

    return actions;
  };

  const sortedOrders = useMemo(() => orders, [orders]);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return sortedOrders;
    const needle = search.trim().toLowerCase();
    return sortedOrders.filter((order) => {
      const orderId = order._id?.toLowerCase() ?? "";
      const itemTitles = (order.items || [])
        .map((i) => i.book?.title || i.title || "")
        .join(" ")
        .toLowerCase();
      return orderId.includes(needle) || itemTitles.includes(needle);
    });
  }, [sortedOrders, search]);

  const displayedOrders = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, page]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  useEffect(() => {
    const pageCount = Math.ceil(filteredOrders.length / rowsPerPage);
    if (pageCount > 0 && page >= pageCount) {
      setPage(pageCount - 1);
    }
    if (pageCount === 0 && page !== 0) {
      setPage(0);
    }
  }, [filteredOrders.length, page, rowsPerPage]);

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const isDesktop = () => window.matchMedia("(min-width: 900px)").matches;

    const handlePointerDown = (event) => {
      if (isDesktop()) return;
      isDragging = true;
      startX = event.clientX;
      scrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
      el.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event) => {
      if (!isDragging) return;
      const delta = event.clientX - startX;
      el.scrollLeft = scrollLeft - delta;
    };

    const endDrag = (event) => {
      if (!isDragging) return;
      isDragging = false;
      el.style.cursor = "";
      el.releasePointerCapture?.(event.pointerId);
    };

    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointerleave", endDrag);

    return () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointerleave", endDrag);
    };
  }, []);

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  return (
    <div className="max-w-[96rem] py-10 w-full mx-auto">
      <Background />
      <Box
        className="relative z-10"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography
          variant="h3"
          gutterBottom
          fontFamily="Poppins, sans-serif"
          fontWeight={600}
          sx={{ color: palette.primaryText, mb: 1 }}
        >
          Your Orders
        </Typography>
        {isLoading && (
          <Typography variant="body1" sx={{ color: palette.secondaryText }}>
            Loading orders…
          </Typography>
        )}
        {isError && (
          <Typography variant="body1" sx={{ color: "#fca5a5" }}>
            {error?.response?.data?.message || "Failed to load orders"}
          </Typography>
        )}
        {!isLoading && orders.length === 0 && (
          <Typography variant="body1" sx={{ color: palette.secondaryText }}>
            You have not placed any orders yet.
          </Typography>
        )}
        {orders.length > 0 && (
          <Paper
            sx={{
              bgcolor: "#0f172a",
              color: "white",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              mt: 3,
              fontFamily: "Poppins, sans-serif",
            }}
          >
            <Toolbar
              sx={{
                bgcolor: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                px: 2,
                py: 1,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: palette.primaryText }}
                >
                  Order History
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: palette.secondaryText }}
                >
                  Review your previous purchases
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search by ID or item"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  minWidth: { xs: "100%", sm: 240 },
                  bgcolor: "rgba(15,23,42,0.9)",
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.14)" },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.4)",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "rgba(255,255,255,0.5)",
                    opacity: 1,
                  },
                }}
              />
            </Toolbar>
            <Box
              ref={tableScrollRef}
              className="hide-scroll-sm"
              sx={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                cursor: { xs: "grab", md: "default" },
              }}
            >
              <Table
                size="medium"
                sx={{
                  minWidth: 820,
                  "& th": {
                    py: 2,
                    px: 2.75,
                    color: palette.headerText,
                    fontWeight: 600,
                    letterSpacing: "0.015em",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  },
                  "& td": {
                    py: 2.2,
                    px: 2.75,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ color: palette.headerText, fontWeight: 600 }}
                    >
                      Order
                    </TableCell>
                    <TableCell
                      sx={{ color: palette.headerText, fontWeight: 600 }}
                    >
                      Placed
                    </TableCell>
                    <TableCell
                      sx={{ color: palette.headerText, fontWeight: 600 }}
                    >
                      Items
                    </TableCell>
                    <TableCell
                      sx={{ color: palette.headerText, fontWeight: 600 }}
                    >
                      Total
                    </TableCell>
                    <TableCell
                      sx={{ color: palette.headerText, fontWeight: 600 }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: palette.headerText, fontWeight: 600 }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedOrders.map((order) => {
                    const totalItems =
                      order.items?.reduce(
                        (sum, item) => sum + (item.quantity || 0),
                        0
                      ) || 0;
                    return (
                      <TableRow
                        key={order._id}
                        hover
                        onClick={() => handleOpenDetail(order)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{ color: palette.primaryText }}
                          >
                            #{order._id?.slice(-6) || order._id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ color: palette.primaryText }}
                          >
                            {dayjs(order.createdAt).format("MMM D, YYYY")}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: palette.secondaryText }}
                          >
                            {dayjs(order.createdAt).format("h:mm A")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Avatar
                              variant="rounded"
                              src={order.items?.[0]?.book?.coverUrl}
                              alt={
                                order.items?.[0]?.book?.title ||
                                order.items?.[0]?.title
                              }
                              sx={{
                                width: 56,
                                height: 80,
                                borderRadius: 1.5,
                                bgcolor: "rgba(15,23,42,0.4)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                fontSize: 24,
                              }}
                            >
                              {order.items?.[0]?.book?.title?.[0]?.toUpperCase() ||
                                order.items?.[0]?.title?.[0]?.toUpperCase() ||
                                "📘"}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ color: "white" }}
                                noWrap
                                title={
                                  order.items?.[0]?.book?.title ||
                                  order.items?.[0]?.title
                                }
                              >
                                {order.items?.[0]?.book?.title ||
                                  order.items?.[0]?.title ||
                                  "—"}
                                {totalItems > 1 ? ` +${totalItems - 1}` : ""}
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ color: palette.secondaryText }}
                              >
                                {totalItems} item{totalItems === 1 ? "" : "s"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            sx={{ color: palette.primaryText }}
                          >
                            {formatCurrency(order.total)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Chip
                              label={order.status}
                              size="small"
                              variant="outlined"
                              sx={{
                                textTransform: "capitalize",
                                fontWeight: 600,
                                letterSpacing: "0.01em",
                                px: 0.5,
                                ...statusChipStyles(order.status),
                              }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="text"
                            size="small"
                            sx={{
                              color: "#ffffff",
                              fontWeight: 600,
                              "&:hover": {
                                color: "#c7d2fe",
                                bgcolor: "rgba(255,255,255,0.08)",
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(order);
                            }}
                          >
                            View details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div"
              count={filteredOrders.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
              onRowsPerPageChange={() => {}}
              sx={{
                color: "white",
                px: 2,
                "& .MuiTablePagination-actions .MuiIconButton-root": {
                  color: "#ffffff",
                  transition: "background-color 0.2s ease, color 0.2s ease",
                },
                "& .MuiTablePagination-actions .MuiIconButton-root .MuiSvgIcon-root":
                  {
                    color: "#ffffff",
                  },
                "& .MuiTablePagination-actions .MuiIconButton-root:not(.Mui-disabled)":
                  {
                    cursor: "pointer",
                  },
                "& .MuiTablePagination-actions .MuiIconButton-root:not(.Mui-disabled):hover":
                  {
                    bgcolor: "rgba(255,255,255,0.12)",
                  },
                "& .MuiTablePagination-actions .MuiIconButton-root.Mui-disabled .MuiSvgIcon-root":
                  {
                    color: "rgba(226,232,255,0.3)",
                  },
              }}
            />
          </Paper>
        )}
        <OrderDetailDialog
          open={detailOpen}
          order={selectedOrder}
          onClose={closeDetailDialog}
          statusColorGetter={statusColor}
          statusDescription={statusDescription}
          renderActions={renderOrderActions}
        />
      </Box>
    </div>
  );
}
