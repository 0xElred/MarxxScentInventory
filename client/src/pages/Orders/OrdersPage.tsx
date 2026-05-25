import { useCallback, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import TableSearchBar from "../../components/layout/TableSearchBar";
import TableScrollContainer from "../../components/layout/TableScrollContainer";
import Pagination from "../../components/layout/Pagination";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useToastMessage } from "../../hooks/useToastMessage";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import OrderService from "../../services/OrderService";
import type { Order, OrderStatus } from "../../interfaces/OrderInterface";
import { VARIANT_LABELS } from "../../utils/productVariants";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/table";
import Spinner from "../../components/Spinner/Spinner";
import OrderFormModal from "./components/OrderFormModal";
import { parsePaginated } from "../../utils/parsePaginated";
import { formatPeso } from "../../utils/formatPeso";
import { getOrderTotal } from "../../utils/orderTotals";

const statusStyles: Record<OrderStatus, string> = {
    pending: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
    shipped: "bg-blue-900/40 text-blue-300 border-blue-700",
    delivered: "bg-green-900/40 text-green-300 border-green-700",
    canceled: "bg-red-900/40 text-red-300 border-red-700",
};

const canEditDetails = (status: OrderStatus) => status === "pending";
const canCancel = (status: OrderStatus) => status === "pending";
const canChangeStatus = (status: OrderStatus) => status === "pending" || status === "shipped";

const statusOptionsFor = (status: OrderStatus): OrderStatus[] => {
    if (status === "pending") return ["pending", "shipped", "delivered"];
    if (status === "shipped") return ["shipped", "delivered"];
    return [];
};

const OrdersPage = () => {
    const [addOpen, setAddOpen] = useState(false);
    const [editOrder, setEditOrder] = useState<Order | null>(null);
    const { message, isVisible, showToastMessage, closeToastMessage } = useToastMessage("", false, false);

    const fetchOrders = useCallback(async (page: number, search: string) => {
        const res = await OrderService.loadOrders(page, search, "all");
        if (res.status !== 200) throw new Error("Failed to load orders");
        return parsePaginated<Order>(res.data, "orders");
    }, []);

    const {
        items: orders,
        search,
        setSearch,
        page,
        lastPage,
        total,
        loading,
        setPage,
        refresh,
    } = usePaginatedList(fetchOrders);

    const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
        if (!canChangeStatus(order.status) || newStatus === order.status) return;

        try {
            const res = await OrderService.updateOrderStatus(order.order_id, newStatus);
            if (res.status === 200) {
                showToastMessage(res.data.message, false);
                refresh();
            }
        } catch (e: unknown) {
            const axiosErr = e as { response?: { data?: { message?: string } } };
            showToastMessage(axiosErr.response?.data?.message ?? "Could not update order status.", true);
        }
    };

    const handleCancel = async (order: Order) => {
        try {
            const res = await OrderService.destroyOrder(order.order_id);
            if (res.status === 200) {
                showToastMessage("Order canceled.", false);
                refresh();
            }
        } catch (e) {
            console.error(e);
            showToastMessage("Could not cancel order.", true);
        }
    };

    return (
        <>
            <ToastMessage message={message} isVisible={isVisible} onClose={closeToastMessage} />
            <OrderFormModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSaved={(m) => { showToastMessage(m, false); refresh(); }} />
            <OrderFormModal
                order={editOrder && canEditDetails(editOrder.status) ? editOrder : null}
                isOpen={!!editOrder && canEditDetails(editOrder.status)}
                onClose={() => setEditOrder(null)}
                onSaved={(m) => { showToastMessage(m, false); setEditOrder(null); refresh(); }}
            />

            <PageHeader
                title="Orders"
                subtitle="Manage customer orders and shipments"
                action={
                    <button type="button" onClick={() => setAddOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        + Add New Order
                    </button>
                }
            />

            <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#152a4a]">
                <TableSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search order ID, product, receiver, or address..."
                />
                {loading ? (
                    <div className="flex justify-center py-16"><Spinner size="lg" /></div>
                ) : (
                    <>
                        <TableScrollContainer>
                        <Table>
                            <TableHeader className="border-b border-slate-700 bg-[#0f1f3d] text-left text-xs uppercase text-gray-400">
                                <TableRow>
                                    <TableCell isHeader className="whitespace-nowrap px-5 py-3">Order ID</TableCell>
                                    <TableCell isHeader className="whitespace-nowrap px-5 py-3">Products</TableCell>
                                    <TableCell isHeader className="whitespace-nowrap px-5 py-3">Receiver Name</TableCell>
                                    <TableCell isHeader className="whitespace-nowrap px-5 py-3">Address</TableCell>
                                    <TableCell isHeader className="whitespace-nowrap px-5 py-3">Status</TableCell>
                                    <TableCell isHeader className="whitespace-nowrap px-5 py-3">Price</TableCell>
                                    <TableCell isHeader className="whitespace-nowrap px-5 py-3">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-700 text-sm text-gray-200">
                                {orders.map((o) => (
                                    <TableRow key={o.order_id} className="hover:bg-slate-800/40">
                                        <TableCell className="whitespace-nowrap px-5 py-3 font-mono text-xs">{o.order_code}</TableCell>
                                        <TableCell className="whitespace-nowrap px-5 py-3">
                                            {o.items?.length
                                                ? o.items.map((item) => (
                                                      <span key={item.order_item_id} className="block">
                                                          {item.product?.name ?? "—"} ({VARIANT_LABELS[item.variant_type] ?? item.variant_type}) × {item.quantity}
                                                      </span>
                                                  ))
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-5 py-3">{o.receiver_name}</TableCell>
                                        <TableCell className="max-w-[200px] truncate px-5 py-3 text-gray-400">{o.address}</TableCell>
                                        <TableCell className="whitespace-nowrap px-5 py-3">
                                            {canChangeStatus(o.status) ? (
                                                <select
                                                    value={o.status}
                                                    onChange={(e) => void handleStatusChange(o, e.target.value as OrderStatus)}
                                                    className={`rounded-lg border px-2 py-1.5 text-xs capitalize cursor-pointer ${statusStyles[o.status]}`}
                                                >
                                                    {statusOptionsFor(o.status).map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`rounded-full border px-3 py-1 text-xs capitalize ${statusStyles[o.status]}`}>
                                                    {o.status}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 font-medium whitespace-nowrap">
                                            {formatPeso(getOrderTotal(o))}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setEditOrder(o)}
                                                disabled={!canEditDetails(o.status)}
                                                className={`mr-3 ${canEditDetails(o.status) ? "text-gray-300 hover:text-white cursor-pointer" : "text-gray-600 cursor-not-allowed"}`}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void handleCancel(o)}
                                                disabled={!canCancel(o.status)}
                                                className={canCancel(o.status) ? "text-red-400 hover:text-red-300 cursor-pointer" : "text-gray-600 cursor-not-allowed"}
                                            >
                                                Cancel
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {orders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500">No orders found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </TableScrollContainer>
                        <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />
                    </>
                )}
            </div>
        </>
    );
};

export default OrdersPage;
