import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../api/cart.js";
import {
  Container,
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import toast from "react-hot-toast";
import { confirmToast } from "../utils/confirmToast.jsx";
import Background from "../components/Background.jsx";
import CartSkeleton from "../components/skeletons/CartSkeleton.jsx";

export default function Cart() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  const dismissAfterOneSecond = (toastId) => {
    if (!toastId) return;
    setTimeout(() => toast.dismiss(toastId), 2000);
  };

  const updateMut = useMutation({
    mutationFn: ({ bookId, quantity }) => updateCartItem(bookId, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update item"),
  });

  const removeMut = useMutation({
    mutationFn: (bookId) => removeCartItem(bookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      dismissAfterOneSecond(toast.success("Item removed from cart"));
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to remove item"),
  });

  const clearMut = useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      dismissAfterOneSecond(toast.success("Cart cleared"));
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to clear cart"),
  });

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, i) => sum + (i.book?.price_npr || 0) * i.quantity,
    0
  );
  const savings = Number(cart?.savings || 0);
  const pickupFee = Number(cart?.pickupFee || 0);
  const tax = Number(cart?.tax || 0);
  const total = subtotal - savings + pickupFee + tax;

  const formatCurrency = (value = 0) => {
    const amount = Number(value || 0);
    const formatter = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    });
    const prefix = amount < 0 ? "-" : "";
    return `${prefix}Rs. ${formatter.format(Math.abs(amount))}`;
  };

  const quantityButtonSx = {
    width: 36,
    height: 36,
    borderRadius: "12px",
    border: "1px solid rgba(148, 163, 184, 0.24)",
    color: "#E5E7EB",
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(59, 130, 246, 0.15)",
      borderColor: "rgba(59, 130, 246, 0.65)",
    },
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        py: { xs: 4, md: 6 },
        position: "relative",
        maxWidth: "96rem",
        px: { xs: 2, md: 4 },
        mx: "auto",
      }}
    >
      <Background />
      {isLoading ? (
        <CartSkeleton />
      ) : (
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontFamily: "poppins",
              fontWeight: 600,
              color: "#F9FAFB",
              mb: 4,
            }}
          >
            Shopping Cart
          </Typography>

          {items.length === 0 ? (
            <Paper
              sx={{
                backgroundColor: "rgba(17, 24, 39, 0.9)",
                borderRadius: 4,
                border: "1px solid rgba(148, 163, 184, 0.15)",
                p: { xs: 4, md: 6 },
              }}
            >
              <Typography fontFamily={"poppins"} sx={{ color: "#E5E7EB" }}>
                Your cart is empty.
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: { xs: 3, lg: 4 },
                gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
              }}
            >
              <Paper
                sx={{
                  background:
                    "linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85))",
                  borderRadius: 4,
                  border: "1px solid rgba(148, 163, 184, 0.12)",
                  boxShadow: "0 24px 40px -24px rgba(15, 23, 42, 0.8)",
                  overflow: "hidden",
                }}
              >
                {items.map((i, index) => (
                  <Box
                    key={i.book._id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1.4fr auto auto auto",
                      },
                      alignItems: "center",
                      gap: { xs: 2.5, sm: 3 },
                      px: { xs: 2.5, sm: 4 },
                      py: { xs: 2.5, sm: 3 },
                      borderBottom:
                        index !== items.length - 1
                          ? "1px solid rgba(148, 163, 184, 0.12)"
                          : "none",
                      color: "#E5E7EB",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5,
                        gridColumn: { xs: "1 / -1", sm: "auto" },
                      }}
                    >
                      <Link
                        to={`/books/${i.book._id}`}
                        onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
                      >
                        <Box
                          component="img"
                          src={i.book.coverUrl || "/placeholder.svg"}
                          alt={i.book.title}
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                            objectFit: "cover",
                            boxShadow:
                              "0 12px 24px -12px rgba(15, 23, 42, 0.8)",
                            cursor: "pointer",
                          }}
                        />
                      </Link>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontFamily: "poppins",
                            fontWeight: 500,
                            color: "#F9FAFB",
                            mb: 0.5,
                          }}
                        >
                          {i.book.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(148, 163, 184, 0.85)",
                            fontFamily: "poppins",
                          }}
                        >
                          {formatCurrency(i.book.price_npr)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        justifyContent: { xs: "flex-start", sm: "center" },
                        gridColumn: { xs: "1 / -1", sm: "auto" },
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={quantityButtonSx}
                        onClick={() =>
                          updateMut.mutate({
                            bookId: i.book._id,
                            quantity: Math.max(0, i.quantity - 1),
                          })
                        }
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: "poppins",
                          fontWeight: 500,
                          minWidth: 24,
                          textAlign: "center",
                        }}
                      >
                        {i.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        sx={quantityButtonSx}
                        onClick={() =>
                          updateMut.mutate({
                            bookId: i.book._id,
                            quantity: i.quantity + 1,
                          })
                        }
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: "poppins",
                        fontWeight: 600,
                        textAlign: { xs: "left", sm: "right" },
                        gridColumn: { xs: "1 / -1", sm: "auto" },
                      }}
                    >
                      {formatCurrency((i.book?.price_npr || 0) * i.quantity)}
                    </Typography>

                    <IconButton
                      onClick={async () => {
                        const ok = await confirmToast({
                          message: `Remove "${i.book.title}" from cart?`,
                          confirmText: "Remove",
                          duration: 2000,
                        });
                        if (ok) removeMut.mutate(i.book._id);
                      }}
                      sx={{
                        justifySelf: { xs: "flex-start", sm: "flex-end" },
                        color: "rgba(248, 113, 113, 0.85)",
                        "&:hover": {
                          backgroundColor: "rgba(248, 113, 113, 0.12)",
                          color: "rgba(248, 113, 113, 1)",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Paper>

              <Paper
                sx={{
                  background:
                    "linear-gradient(160deg, rgba(17, 24, 39, 0.92), rgba(15, 23, 42, 0.88))",
                  borderRadius: 4,
                  border: "1px solid rgba(148, 163, 184, 0.12)",
                  boxShadow: "0 24px 40px -24px rgba(15, 23, 42, 0.8)",
                  p: { xs: 3, md: 4 },
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  color: "#E5E7EB",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "poppins",
                    fontWeight: 600,
                    color: "#F9FAFB",
                  }}
                >
                  Order summary
                </Typography>

                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}
                >
                  {[
                    {
                      label: "Original price",
                      value: formatCurrency(subtotal),
                      valueColor: "#F9FAFB",
                    },
                    {
                      label: "Savings",
                      value: formatCurrency(-savings),
                      valueColor: "#34D399",
                    },
                    {
                      label: "Store Pickup",
                      value: formatCurrency(pickupFee),
                      valueColor: "#F9FAFB",
                    },
                    {
                      label: "Tax",
                      value: formatCurrency(tax),
                      valueColor: "#F9FAFB",
                    },
                  ].map((row) => (
                    <Box
                      key={row.label}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontFamily: "poppins",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(148, 163, 184, 0.85)" }}
                      >
                        {row.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: row.valueColor, fontWeight: 500 }}
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    borderTop: "1px solid rgba(148, 163, 184, 0.12)",
                    pt: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "poppins",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: "#F9FAFB" }}
                    >
                      Total
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "#F9FAFB" }}
                    >
                      {formatCurrency(total)}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    mt: 1,
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  }}
                >
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/books"
                    sx={{
                      borderColor: "rgba(148, 163, 184, 0.3)",
                      color: "#E5E7EB",
                      fontFamily: "poppins",
                      fontWeight: 500,
                      textTransform: "none",
                      py: 1.2,
                      "&:hover": {
                        borderColor: "rgba(148, 163, 184, 0.6)",
                        backgroundColor: "rgba(148, 163, 184, 0.08)",
                      },
                    }}
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="contained"
                    disabled={items.length === 0}
                    onClick={() => {
                      navigate("/checkout"),
                        scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    sx={{
                      background: "linear-gradient(90deg, #2563EB, #3B82F6)",
                      fontFamily: "poppins",
                      fontWeight: 600,
                      textTransform: "none",
                      py: 1.2,
                      boxShadow: "0 18px 40px -20px rgba(37, 99, 235, 0.9)",
                      "&:hover": {
                        background: "linear-gradient(90deg, #1D4ED8, #2563EB)",
                      },
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </Box>

                <Button
                  variant="text"
                  color="error"
                  onClick={async () => {
                    const ok = await confirmToast({
                      message: "Clear all items from cart?",
                      confirmText: "Clear",
                    });
                    if (ok) clearMut.mutate();
                  }}
                  sx={{
                    mt: 1,
                    fontFamily: "poppins",
                    textTransform: "none",
                    fontWeight: 500,
                    alignSelf: "center",
                    color: "rgba(248, 113, 113, 0.9)",
                    "&:hover": {
                      backgroundColor: "rgba(248, 113, 113, 0.12)",
                      color: "rgba(248, 113, 113, 1)",
                    },
                  }}
                >
                  Clear Cart
                </Button>
              </Paper>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}
