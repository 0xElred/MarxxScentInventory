import { useCallback, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import TableSearchBar from "../../components/layout/TableSearchBar";
import Pagination from "../../components/layout/Pagination";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useToastMessage } from "../../hooks/useToastMessage";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import ProductService from "../../services/ProductService";
import type { Product } from "../../interfaces/ProductInterface";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/table";
import Spinner from "../../components/Spinner/Spinner";
import ProductFormModal from "./components/ProductFormModal";
import { formatPeso } from "../../utils/formatPeso";
import DeleteProductModal from "./components/DeleteProductModal";
import { parsePaginated } from "../../utils/parsePaginated";

const ProductsPage = () => {
    const [addOpen, setAddOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
    const { message, isVisible, showToastMessage, closeToastMessage } = useToastMessage("", false, false);

    const fetchProducts = useCallback(
        async (page: number, search: string) => {
            const res = await ProductService.loadProducts(page, search);
            if (res.status !== 200) throw new Error("Failed to load products");
            return parsePaginated<Product>(res.data, "products");
        },
        []
    );

    const {
        items: products,
        search,
        setSearch,
        page,
        lastPage,
        total,
        loading,
        setPage,
        refresh,
    } = usePaginatedList(fetchProducts);

    return (
        <>
            <ToastMessage message={message} isVisible={isVisible} onClose={closeToastMessage} />
            <ProductFormModal
                isOpen={addOpen}
                onClose={() => setAddOpen(false)}
                onSaved={(msg) => {
                    showToastMessage(msg, false);
                    refresh();
                }}
            />
            <ProductFormModal
                product={editProduct}
                isOpen={!!editProduct}
                onClose={() => setEditProduct(null)}
                onSaved={(msg) => {
                    showToastMessage(msg, false);
                    setEditProduct(null);
                    refresh();
                }}
            />
            <DeleteProductModal
                product={deleteProduct}
                isOpen={!!deleteProduct}
                onClose={() => setDeleteProduct(null)}
                onDeleted={(msg) => {
                    showToastMessage(msg, false);
                    setDeleteProduct(null);
                    refresh();
                }}
            />

            <PageHeader
                title="Products"
                subtitle="Manage your product catalog"
                action={
                    <button
                        type="button"
                        onClick={() => setAddOpen(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Add New Product
                    </button>
                }
            />

            <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#152a4a]">
                <TableSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name or description..."
                />
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader className="border-b border-slate-700 bg-[#0f1f3d] text-left text-xs uppercase text-gray-400">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3">Photo</TableCell>
                                    <TableCell isHeader className="px-5 py-3">Product Name</TableCell>
                                    <TableCell isHeader className="px-5 py-3">Price</TableCell>
                                    <TableCell isHeader className="px-5 py-3">Bottles</TableCell>
                                    <TableCell isHeader className="px-5 py-3">5ML</TableCell>
                                    <TableCell isHeader className="px-5 py-3">10ML</TableCell>
                                    <TableCell isHeader className="px-5 py-3">Description</TableCell>
                                    <TableCell isHeader className="px-5 py-3">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-700 text-sm text-gray-200">
                                {products.map((p) => (
                                    <TableRow key={p.product_id} className="hover:bg-slate-800/40">
                                        <TableCell className="px-5 py-3">
                                            {p.photo ? (
                                                <img src={p.photo} alt={p.name} className="h-10 w-10 rounded object-cover" />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-800 text-xs">—</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 font-medium">{p.name}</TableCell>
                                        <TableCell className="px-5 py-3">{formatPeso(p.price)}</TableCell>
                                        <TableCell className="px-5 py-3">{p.bottles}</TableCell>
                                        <TableCell className="px-5 py-3">{p.stock_5ml}</TableCell>
                                        <TableCell className="px-5 py-3">{p.stock_10ml}</TableCell>
                                        <TableCell className="max-w-xs truncate px-5 py-3 text-gray-400">
                                            {p.description || "—"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3">
                                            <button
                                                type="button"
                                                className="mr-4 text-gray-300 hover:text-white"
                                                onClick={() => setEditProduct(p)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="text-red-400 hover:text-red-300"
                                                onClick={() => setDeleteProduct(p)}
                                            >
                                                Delete
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {products.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500">
                                            No products found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <Pagination
                            currentPage={page}
                            lastPage={lastPage}
                            total={total}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </div>
        </>
    );
};

export default ProductsPage;
