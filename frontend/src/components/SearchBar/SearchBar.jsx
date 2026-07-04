import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

function SearchBar({ initialValues = {} }) {
    const navigate = useNavigate();
    const [location, setLocation] = useState(initialValues.location || "");
    const [checkIn, setCheckIn] = useState(initialValues.checkIn || "");
    const [checkOut, setCheckOut] = useState(initialValues.checkOut || "");
    const [guests, setGuests] = useState(initialValues.guests || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (location.trim()) params.set("location", location.trim());
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        if (guests) params.set("guests", guests);
        navigate(`/search?${params.toString()}`);
    };

    return (
        <form className="search-bar" onSubmit={handleSubmit} role="search" aria-label="Search stays">
            <div className="search-field search-field-location">
                <label htmlFor="search-location">Where</label>
                <input
                    id="search-location"
                    type="text"
                    placeholder="Search destinations"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    aria-label="Search location"
                />
            </div>
            <div className="search-field">
                <label htmlFor="search-checkin">Check in</label>
                <input
                    id="search-checkin"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    aria-label="Check-in date"
                />
            </div>
            <div className="search-field">
                <label htmlFor="search-checkout">Check out</label>
                <input
                    id="search-checkout"
                    type="date"
                    value={checkOut}
                    min={checkIn || undefined}
                    onChange={(e) => setCheckOut(e.target.value)}
                    aria-label="Check-out date"
                />
            </div>
            <div className="search-field">
                <label htmlFor="search-guests">Guests</label>
                <input
                    id="search-guests"
                    type="number"
                    min={1}
                    placeholder="Add guests"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    aria-label="Number of guests"
                />
            </div>
            <button type="submit" className="search-submit-btn" aria-label="Search stays">
                <FaSearch />
                <span>Search</span>
            </button>
        </form>
    );
}

export default SearchBar;
