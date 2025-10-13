import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Stack,
  TextField,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBook, createBook, updateBook } from "../../api/books.js";
import toast from "react-hot-toast";
import { confirmToast } from "../../utils/confirmToast.jsx";
import Background from "../../components/Background.jsx";
import AdminFormSkeleton from "../../components/skeletons/AdminFormSkeleton.jsx";

const FormShell = styled(Box)(() => ({
  position: "relative",
  zIndex: 10,
  borderRadius: 24,
  padding: 32,
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.82))",
  border: "1px solid rgba(148,163,184,0.35)",
  boxShadow: "0 24px 48px -24px rgba(15,23,42,0.45)",
  backdropFilter: "blur(18px)",
  color: "#f8fafc",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.55)",
    border: "1px solid rgba(148,163,184,0.35)",
    color: theme.palette.grey[50],
  },
  "& .MuiInputBase-input": {
    padding: "14px 16px",
  },
  "& label": {
    color: "rgba(226,232,240,0.7)",
    fontWeight: 500,
  },
  "& label.Mui-focused": {
    color: theme.palette.primary.light,
  },
  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
    borderColor: theme.palette.primary.light,
  },
}));

export default function AdminBookForm({ mode = "create" }) {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = mode === "edit";
  const id = params.id;
  const qc = useQueryClient();

  const { data: book, isLoading: isBookLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBook(id),
    enabled: isEdit && !!id,
  });

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    price_npr: "",
    category: "",
    isbn: "",
    stock: "",
  });
  const [cover, setCover] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (book && isEdit) {
      setForm({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
        price_npr: book.price_npr || "",
        category: book.category || "",
        isbn: book.isbn || "",
        stock: book.stock || "",
      });
      // show existing cover as preview when editing
      if (book.coverUrl) setPreviewUrl(book.coverUrl);
    }
  }, [book, isEdit]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const mut = useMutation({
    mutationFn: async () => {
      const payload = { ...form };
      if (cover) payload.cover = cover;
      if (isEdit) return updateBook(id, payload);
      return createBook(payload);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["books"] });
      navigate("/admin/books", { replace: true });
    },
  });

  return (
    <Container sx={{ py: 4 }}>
      <Background />
      <FormShell>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ letterSpacing: 4, opacity: 0.7 }}
            >
              Library
            </Typography>
            <Typography variant="h4" component="h1">
              {isEdit ? "Edit Book" : "Add New Book"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 2 }}
          >
            Back
          </Button>
        </Stack>
        {isBookLoading ? (
          <AdminFormSkeleton />
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                name="title"
                label="Title"
                value={form.title}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                name="author"
                label="Author"
                value={form.author}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                name="price_npr"
                label="Price"
                type="number"
                value={form.price_npr}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                name="stock"
                label="Stock"
                type="number"
                value={form.stock}
                onChange={onChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                name="category"
                label="Category"
                value={form.category}
                onChange={onChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                name="isbn"
                label="ISBN"
                value={form.isbn}
                onChange={onChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                name="description"
                label="Description"
                value={form.description}
                onChange={onChange}
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  borderColor: "rgba(148,163,184,0.35)",
                  color: "inherit",
                }}
              >
                Upload Cover
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setCover(file);
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setPreviewUrl(url);
                    }
                  }}
                />
              </Button>
            </Grid>
            {previewUrl && (
              <Grid item xs={12}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="flex-start"
                >
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Cover preview"
                    sx={{
                      maxWidth: 260,
                      borderRadius: 4,
                      border: "1px solid rgba(148,163,184,0.35)",
                      boxShadow: "0 12px 24px -16px rgba(15,23,42,0.65)",
                    }}
                  />
                  <Button
                    variant="text"
                    color="error"
                    onClick={() => {
                      setCover(null);
                      setPreviewUrl("");
                    }}
                  >
                    Remove image
                  </Button>
                </Stack>
              </Grid>
            )}
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ borderRadius: 2, minWidth: 180 }}
                  onClick={async () => {
                    const action = isEdit
                      ? "Save changes to this book?"
                      : "Add this book?";
                    const ok = await confirmToast({
                      message: action,
                      confirmText: isEdit ? "Save" : "Add",
                    });
                    if (ok) {
                      await toast.promise(mut.mutateAsync(), {
                        loading: isEdit ? "Saving changes…" : "Creating book…",
                        success: isEdit ? "Book updated" : "Book added",
                        error: (err) =>
                          err?.response?.data?.message || "Action failed",
                      });
                    }
                  }}
                  disabled={mut.isLoading}
                >
                  {mut.isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isEdit ? (
                    "Save Changes"
                  ) : (
                    "Create Book"
                  )}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ borderRadius: 2 }}
                  onClick={() => navigate("/admin/books")}
                >
                  Cancel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        )}
      </FormShell>
    </Container>
  );
}
