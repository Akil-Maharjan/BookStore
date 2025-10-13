import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBooks, deleteBook } from "../../api/books.js";
import { Link } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TableContainer,
  Chip,
  Stack,
  TablePagination,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import toast from "react-hot-toast";
import { confirmToast } from "../../utils/confirmToast.jsx";
import Background from "../../components/Background.jsx";
import AdminTableSkeleton from "../../components/skeletons/AdminTableSkeleton.jsx";

const HeadCell = styled(TableCell)(({ theme }) => ({
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: theme.typography.pxToRem(14),
  fontWeight: 900,
  color: "black",
  borderBottom: `1px solid black`,
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(135deg, rgba(15,23,42,0.8), rgba(15,23,42,0.6))"
      : "linear-gradient(135deg, rgba(226,232,240,0.7), rgba(241,245,249,0.9))",
  padding: theme.spacing(2, 3),
  [theme.breakpoints.down("sm")]: {
    fontSize: theme.typography.pxToRem(12),
    padding: theme.spacing(1.5, 2),
  },
}));

const BodyCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(148, 163, 184, 0.15)"
      : "rgba(148, 163, 184, 0.25)"
  }`,
  color: "white",
  fontSize: theme.typography.pxToRem(15),
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    fontSize: theme.typography.pxToRem(13),
    padding: theme.spacing(1.5),
  },
}));

export default function AdminBooksList() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["books", { admin: true }],
    queryFn: () => fetchBooks({ limit: 100 }),
  });
  const items = React.useMemo(() => data?.items ?? [], [data]);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const filteredItems = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      const title = item.title?.toLowerCase() ?? "";
      const author = item.author?.toLowerCase() ?? "";
      return title.includes(query) || author.includes(query);
    });
  }, [items, search]);

  const paginatedItems = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  React.useEffect(() => {
    setPage(0);
  }, [search, rowsPerPage, filteredItems.length]);

  const delMut = useMutation({
    mutationFn: async (id) => {
      const promise = deleteBook(id);
      await toast.promise(promise, {
        loading: "Deleting book…",
        success: "Book deleted",
        error: (err) => err?.response?.data?.message || "Delete failed",
      });
      return promise;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["books"] });
      const prev = qc.getQueryData(["books", { admin: true }]);
      if (prev?.items) {
        qc.setQueryData(["books", { admin: true }], {
          ...prev,
          items: prev.items.filter((b) => b._id !== id),
        });
      }
      return { prev };
    },
    onError: (err, _id, context) => {
      if (context?.prev)
        qc.setQueryData(["books", { admin: true }], context.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });

  return (
    <Container sx={{ py: 4 }}>
      <Background />
      <div className="relative z-10">
        <Box className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-4">
          <Typography variant="h4" className="text-white">
            Manage Books
          </Typography>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex-1 relative z-10">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books..."
                className="max-w-[30rem] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:ring-slate-600"
              />
            </div>
            <Button
              variant="contained"
              component={Link}
              to="/admin/books/new"
              className="self-start sm:self-center"
            >
              Add Book
            </Button>
          </div>
        </Box>

        <TableContainer
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            overflowX: "auto",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.65))",
            backdropFilter: "blur(18px)",
            boxShadow: "0 18px 36px -18px rgba(15,23,42,0.65)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <HeadCell>Title</HeadCell>
                <HeadCell>Author</HeadCell>
                <HeadCell align="right">Price</HeadCell>
                <HeadCell align="center">Stock</HeadCell>
                <HeadCell align="right">Actions</HeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <AdminTableSkeleton rows={8} />
              ) : filteredItems.length ? (
                paginatedItems.map((b) => (
                  <TableRow
                    key={b._id}
                    hover
                    sx={{
                      transition: "transform 0.2s ease, background 0.2s ease",
                      opacity: delMut.isPending ? 0.6 : 1,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        background: "rgba(148, 163, 184, 0.08)",
                      },
                    }}
                  >
                    <BodyCell sx={{ fontWeight: 600 }}>{b.title}</BodyCell>
                    <BodyCell>{b.author}</BodyCell>
                    <BodyCell align="right">Rs. {b.price_npr ?? "—"}</BodyCell>
                    <BodyCell align="center">
                      <Chip
                        size="small"
                        label={
                          typeof b.stock === "number"
                            ? `${b.stock} in stock`
                            : "—"
                        }
                        color={
                          b.stock > 5
                            ? "success"
                            : b.stock > 0
                            ? "warning"
                            : "error"
                        }
                        variant="outlined"
                      />
                    </BodyCell>
                    <BodyCell
                      align="center"
                      sx={{
                        minWidth: { xs: 140, sm: 160 },
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                        textAlign: "center",
                      }}
                    >
                      <IconButton
                        component={Link}
                        to={`/admin/books/${b._id}/edit`}
                        color="primary"
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={delMut.isPending}
                        onClick={async () => {
                          const ok = await confirmToast({
                            message: `Delete book "${b.title}"? This action cannot be undone.`,
                            confirmText: "Delete",
                          });
                          if (ok) delMut.mutate(b._id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </BodyCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Stack alignItems="center" py={8} spacing={1}>
                      <Typography variant="body1" color="white">
                        No books found.
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.6)">
                        Add a book to get started.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredItems.length > 0 && (
          <Box
            sx={{
              mt: 3,
              borderRadius: 3,
              overflow: "hidden",
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.75))",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              boxShadow: "0 12px 24px -16px rgba(15,23,42,0.75)",
              mx: "auto",
              width: { xs: "100%", md: "fit-content" },
              maxWidth: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <TablePagination
              component="div"
              count={filteredItems.length}
              page={page}
              onPageChange={(_event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                color: "white",
                width: "100%",
                ".MuiTablePagination-toolbar": {
                  flexWrap: "wrap",
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 },
                  gap: { xs: 1, sm: 0 },
                },
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                  {
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  },
                ".MuiTablePagination-actions": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            />
          </Box>
        )}
      </div>
    </Container>
  );
}
