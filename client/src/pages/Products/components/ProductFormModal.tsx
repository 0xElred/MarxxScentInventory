import { useEffect, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/inputs/FloatingLabelInput";
import UploadInput from "../../../components/inputs/UploadInput";
import SubmitButton from "../../../components/buttons/SubmitButton";
import ProductService from "../../../services/ProductService";
import type { Product, ProductFieldErrors } from "../../../interfaces/ProductInterface";
import { appendFile } from "../../../utils/appendFile";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: (message: string) => void;
    product?: Product | null;
}

const inputClass = "block w-full rounded-lg border border-gray-700 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white";
const labelClass = "text-gray-400";

const ProductFormModal: FC<Props> = ({ isOpen, onClose, onSaved, product }) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [bottles, setBottles] = useState("");
    const [stock5ml, setStock5ml] = useState("");
    const [stock10ml, setStock10ml] = useState("");
    const [description, setDescription] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [errors, setErrors] = useState<ProductFieldErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const clearAddForm = () => {
        setName("");
        setPrice("");
        setBottles("");
        setStock5ml("");
        setStock10ml("");
        setDescription("");
        setPhoto(null);
        setErrors({});
    };

    useEffect(() => {
        if (!isOpen) return;

        if (product) {
            setName(product.name);
            setPrice(String(product.price));
            setBottles(String(product.bottles));
            setStock5ml(String(product.stock_5ml));
            setStock10ml(String(product.stock_10ml));
            setDescription(product.description ?? "");
            setPhoto(null);
        } else {
            clearAddForm();
        }
        setErrors({});
    }, [product, isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        const fd = new FormData();
        fd.append("name", name);
        fd.append("price", price);
        fd.append("bottles", bottles);
        fd.append("stock_5ml", stock5ml);
        fd.append("stock_10ml", stock10ml);
        fd.append("description", description);
        if (photo) appendFile(fd, "photo", photo);

        try {
            const res = product
                ? await ProductService.updateProduct(product.product_id, fd)
                : await ProductService.storeProduct(fd);
            if (res.status === 200) {
                if (!product) clearAddForm();
                onSaved(res.data.message);
                onClose();
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number; data?: { errors?: ProductFieldErrors } } };
            if (axiosErr.response?.status === 422) {
                setErrors(axiosErr.response.data?.errors ?? {});
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="bg-[#111111] border border-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-white">
                {product ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FloatingLabelInput label="Name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} errors={errors.name} required newInputClassName={inputClass} newLabelClassName={labelClass} />
                <FloatingLabelInput label="Price" name="price" type="text" value={price} onChange={(e) => setPrice(e.target.value)} errors={errors.price} required newInputClassName={inputClass} newLabelClassName={labelClass} />

                <div>
                    <p className="mb-2 text-sm font-medium text-gray-300">Inventory</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <FloatingLabelInput label="Bottles" name="bottles" type="number" value={bottles} onChange={(e) => setBottles(e.target.value)} errors={errors.bottles} required min={0} newInputClassName={inputClass} newLabelClassName={labelClass} />
                        <FloatingLabelInput label="5ML" name="stock_5ml" type="number" value={stock5ml} onChange={(e) => setStock5ml(e.target.value)} errors={errors.stock_5ml} required min={0} newInputClassName={inputClass} newLabelClassName={labelClass} />
                        <FloatingLabelInput label="10ML" name="stock_10ml" type="number" value={stock10ml} onChange={(e) => setStock10ml(e.target.value)} errors={errors.stock_10ml} required min={0} newInputClassName={inputClass} newLabelClassName={labelClass} />
                    </div>
                </div>

                <FloatingLabelInput label="Description" name="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} errors={errors.description} newInputClassName={inputClass} newLabelClassName={labelClass} />
                <UploadInput label={product ? "Photo (optional)" : "Photo"} name="photo" value={photo} onChange={setPhoto} existingImageUrl={product?.photo ?? null} errors={errors.photo} />
                <SubmitButton loading={submitting} label={product ? "Update" : "Save"} />
            </form>
        </Modal>
    );
};

export default ProductFormModal;
