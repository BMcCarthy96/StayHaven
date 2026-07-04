import "./primitives.css";

export default function PriceTag({ price, unit = "night" }) {
    const value = parseFloat(price);
    return (
        <span className="price-tag">
            {!isNaN(value) ? `$${value.toFixed(2)}` : "Price unavailable"}
            {!isNaN(value) && <span className="price-unit">/ {unit}</span>}
        </span>
    );
}
