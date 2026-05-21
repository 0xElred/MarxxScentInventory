export const formatPeso = (amount: number | string) =>
    `₱${Number(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
