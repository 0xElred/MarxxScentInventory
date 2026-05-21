import { useEffect, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/inputs/FloatingLabelInput";
import FloatingLabelSelect from "../../../components/select/FloatingLabelSelect";
import SubmitButton from "../../../components/buttons/SubmitButton";
import OrderService from "../../../services/OrderService";
import type { Order, OrderFieldErrors } from "../../../interfaces/OrderInterface";
import type { Product } from "../../../interfaces/ProductInterface";
import { formatPeso } from "../../../utils/formatPeso";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: (message: string) => void;
    order?: Order | null;
}

const OrderFormModal: FC<Props> = ({ isOpen, onClose, onSaved, order }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [productId, setProductId] = useState("");
    const [receiverName, setReceiverName] = useState("");
    const [address, setAddress] = useState("");
    const [errors, setErrors] = useState<OrderFieldErrors>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            void OrderService.loadProductsForOrder().then((res) => {
                if (res.status === 200) setProducts(res.data.products);
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        if (order) {
            setProductId(String(order.product_id));
            setReceiverName(order.receiver_name);
            setAddress(order.address);
        }
        setErrors({});
    }, [order, isOpen]);

    const clearAddForm = () => {
        setProductId("");
        setReceiverName("");
        setAddress("");
        setErrors({});
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const payload = {
            product_id: Number(productId),
            receiver_name: receiverName,
            address,
        };
        try {
            const res = order
                ? await OrderService.updateOrder(order.order_id, payload)
                : await OrderService.storeOrder(payload);
            if (res.status === 200) {
                if (!order) clearAddForm();
                onSaved(res.data.message);
                onClose();
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number; data?: { errors?: OrderFieldErrors; message?: string } } };
            if (axiosErr.response?.status === 422) setErrors(axiosErr.response.data?.errors ?? {});
        } finally {
            setSubmitting(false);
        }
    };

    const darkInput = "block w-full rounded-lg border border-gray-700 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white";

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="bg-[#111111]">
            <h2 className="mb-4 text-xl font-semibold text-white">{order ? "Edit Order" : "Add New Order"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FloatingLabelSelect label="Product (Order)" name="product_id" value={productId} onChange={(e) => setProductId(e.target.value)} errors={errors.product_id} required newSelectClassName={darkInput} newLabelClassName="text-gray-400">
                    <option value="">Select product</option>
                    {products.map((p) => (
                        <option key={p.product_id} value={p.product_id}>{p.name} — {formatPeso(p.price)}</option>
                    ))}
                </FloatingLabelSelect>
                <FloatingLabelInput label="Receiver Name" name="receiver_name" type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} errors={errors.receiver_name} required newInputClassName={darkInput} newLabelClassName="text-gray-400" />
                <FloatingLabelInput label="Address" name="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} errors={errors.address} required newInputClassName={darkInput} newLabelClassName="text-gray-400" />
                <SubmitButton loading={submitting} label={order ? "Update" : "Save"} />
            </form>
        </Modal>
    );
};

export default OrderFormModal;
