import { MdStar } from "react-icons/md";
import "./primitives.css";

export default function StarRating({ rating, emptyLabel = "New" }) {
    const value = Number(rating);
    return (
        <span className="star-rating">
            <MdStar />
            {value > 0 ? value.toFixed(1) : emptyLabel}
        </span>
    );
}
