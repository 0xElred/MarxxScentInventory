import { useEffect, useMemo, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/inputs/FloatingLabelInput";
import FloatingLabelSelect from "../../../components/select/FloatingLabelSelect";
import SubmitButton from "../../../components/buttons/SubmitButton";
import OrderService from "../../../services/OrderService";
import type { Order, OrderFieldErrors, OrderLineInput } from "../../../interfaces/OrderInterface";
import type { Product } from "../../../interfaces/ProductInterface";
import { formatPeso } from "../../../utils/formatPeso";
import {
    PRODUCT_VARIANTS,
    VARIANT_LABELS,
    getVariantStock,
    getVariantUnitPrice,
    type ProductVariant,
} from "../../../utils/productVariants";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: (message: string) => void;
    order?: Order | null;
}

const emptyLine = (): OrderLineInput => ({
    product_id: "",
    variant_type: "bottle",
    quantity: "1",
});

const OrderFormModal: FC<Props> = ({ isOpen, onClose, onSaved, order }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [lineItems, setLineItems] = useState<OrderLineInput[]>([emptyLine()]);
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
            setReceiverName(order.receiver_name);
            setAddress(order.address);
            setLineItems(
                order.items?.length
                    ? order.items.map((item) => ({
                          product_id: String(item.product_id),
                          variant_type: item.variant_type ?? "bottle",
                          quantity: String(item.quantity),
                      }))
                    : [emptyLine()]
            );
        } else {
            setReceiverName("");
            setAddress("");
            setLineItems([emptyLine()]);
        }
        setErrors({});
    }, [order, isOpen]);

    const getLineProduct = (line: OrderLineInput) =>
        products.find((p) => String(p.product_id) === line.product_id);

    const getMaxQty = (line: OrderLineInput) => {
        const product = getLineProduct(line);
        if (!product) return 0;
        return getVariantStock(product, line.variant_type);
    };

    const clampQuantity = (line: OrderLineInput, rawQty: string): string => {
        const max = getMaxQty(line);
        if (max <= 0) return "0";
        const parsed = parseInt(rawQty, 10);
        if (Number.isNaN(parsed) || parsed < 1) return "1";
        return String(Math.min(parsed, max));
    };

    const updateLine = (index: number, field: keyof OrderLineInput, value: string) => {
        setLineItems((prev) =>
            prev.map((line, i) => {
                if (i !== index) return line;

                const next = { ...line, [field]: value } as OrderLineInput;

                if (field === "product_id" || field === "variant_type") {
                    next.quantity = clampQuantity(next, next.quantity);
                }

                if (field === "quantity") {
                    next.quantity = clampQuantity(next, value);
                }

                return next;
            })
        );
    };

    const orderTotal = useMemo(() => {
        return lineItems.reduce((sum, line) => {
            const product = getLineProduct(line);
            const qty = parseInt(line.quantity, 10) || 0;
            if (!product || qty <= 0) return sum;
            return sum + getVariantUnitPrice(product.price, line.variant_type) * qty;
        }, 0);
    }, [lineItems, products]);

    const addLine = () => setLineItems((prev) => [...prev, emptyLine()]);

    const removeLine = (index: number) => {
        setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const payload = {
            receiver_name: receiverName,
            address,
            items: lineItems
                .filter((line) => line.product_id && parseInt(line.quantity, 10) > 0)
                .map((line) => ({
                    product_id: Number(line.product_id),
                    variant_type: line.variant_type,
                    quantity: Number(line.quantity),
                })),
        };

        if (payload.items.length === 0) {
            setErrors({ items: ["Add at least one product with quantity greater than 0."] });
            setSubmitting(false);
            return;
        }

        try {
            const res = order
                ? await OrderService.updateOrder(order.order_id, payload)
                : await OrderService.storeOrder(payload);
            if (res.status === 200) {
                onSaved(res.data.message);
                onClose();
            }
        } catch (err: unknown) {
            const axiosErr = err as {
                response?: { status?: number; data?: { errors?: OrderFieldErrors; message?: string } };
            };
            if (axiosErr.response?.status === 422) {
                const apiErrors = axiosErr.response.data?.errors;
                if (apiErrors && Object.keys(apiErrors).length > 0) {
                    setErrors(apiErrors);
                } else if (axiosErr.response.data?.message) {
                    setErrors({ items: [axiosErr.response.data.message] });
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    const darkInput = "block w-full rounded-lg border border-gray-700 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white";
    const darkLabel = "text-gray-400";

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="bg-[#111111] border border-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-white">{order ? "Edit Order" : "Add New Order"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-300">Products</p>
                    {lineItems.map((line, index) => {
                        const maxQty = getMaxQty(line);
                        const product = getLineProduct(line);
                        const unitPrice = product
                            ? getVariantUnitPrice(product.price, line.variant_type)
                            : 0;

                        return (
                            <div
                                key={index}
                                className="rounded-lg border border-gray-800 bg-[#0a0a0a]/50 p-3 space-y-2"
                            >
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                                    <div className="min-w-0 flex-1 lg:flex-[5]">
                                        <FloatingLabelSelect
                                            label={`Product ${index + 1}`}
                                            name={`product_id_${index}`}
                                            value={line.product_id}
                                            onChange={(e) => updateLine(index, "product_id", e.target.value)}
                                            errors={errors[`items.${index}.product_id`]}
                                            required
                                            newSelectClassName={darkInput}
                                            newLabelClassName={darkLabel}
                                        >
                                            <option value="">Select product</option>
                                            {products.map((p) => (
                                                <option key={p.product_id} value={p.product_id}>
                                                    {p.name} — Bottle {formatPeso(p.price)}
                                                </option>
                                            ))}
                                        </FloatingLabelSelect>
                                    </div>
                                    <div className="w-full lg:w-36 lg:flex-[3]">
                                        <FloatingLabelSelect
                                            label="Type"
                                            name={`variant_type_${index}`}
                                            value={line.variant_type}
                                            onChange={(e) =>
                                                updateLine(index, "variant_type", e.target.value as ProductVariant)
                                            }
                                            errors={errors[`items.${index}.variant_type`]}
                                            required
                                            newSelectClassName={darkInput}
                                            newLabelClassName={darkLabel}
                                        >
                                            {PRODUCT_VARIANTS.map((v) => (
                                                <option key={v} value={v}>
                                                    {VARIANT_LABELS[v]}
                                                    {product
                                                        ? ` — ${formatPeso(getVariantUnitPrice(product.price, v))}`
                                                        : ""}
                                                </option>
                                            ))}
                                        </FloatingLabelSelect>
                                    </div>
                                    <div className="w-full lg:w-24 lg:flex-[2]">
                                        <FloatingLabelInput
                                            label="Qty"
                                            name={`quantity_${index}`}
                                            type="number"
                                            value={line.quantity}
                                            onChange={(e) => updateLine(index, "quantity", e.target.value)}
                                            errors={errors[`items.${index}.quantity`]}
                                            required
                                            min={maxQty > 0 ? 1 : 0}
                                            max={maxQty > 0 ? maxQty : 0}
                                            disabled={!line.product_id || maxQty <= 0}
                                            newInputClassName={darkInput}
                                            newLabelClassName={darkLabel}
                                        />
                                    </div>
                                    {lineItems.length > 1 && (
                                        <div className="flex w-full shrink-0 flex-col lg:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => removeLine(index)}
                                                className="w-full rounded-lg border border-red-800 px-4 py-2.5 text-sm leading-none text-red-400 hover:bg-red-900/30"
                                            >
                                                Remove
                                            </button>
                                            <p className="mt-1 text-sm invisible select-none" aria-hidden="true">
                                                &nbsp;
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {product && (
                                    <p className="text-xs text-gray-500">
                                        <span className="text-gray-400">
                                            {VARIANT_LABELS[line.variant_type]} price:{" "}
                                            <span className="text-gray-200">{formatPeso(unitPrice)}</span>
                                            {" · "}
                                        </span>
                                        Available:{" "}
                                        <span className={maxQty > 0 ? "text-gray-300" : "text-red-400"}>
                                            {maxQty}
                                        </span>
                                        {maxQty <= 0 && " — out of stock for this type"}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                    <button
                        type="button"
                        onClick={addLine}
                        className="text-sm text-blue-400 hover:text-blue-300"
                    >
                        + Add another product
                    </button>
                    {errors.items && (
                        <p className="text-sm text-red-500" role="alert">
                            {errors.items[0]}
                        </p>
                    )}
                    <p className="text-right text-sm text-gray-400">
                        Order total:{" "}
                        <span className="font-semibold text-white">{formatPeso(orderTotal)}</span>
                    </p>
                </div>

                <FloatingLabelInput
                    label="Receiver Name"
                    name="receiver_name"
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    errors={errors.receiver_name}
                    required
                    newInputClassName={darkInput}
                    newLabelClassName={darkLabel}
                />
                <FloatingLabelInput
                    label="Address"
                    name="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    errors={errors.address}
                    required
                    newInputClassName={darkInput}
                    newLabelClassName={darkLabel}
                />
                <SubmitButton loading={submitting} label={order ? "Update" : "Save"} />
            </form>
        </Modal>
    );
};

export default OrderFormModal;
