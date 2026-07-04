import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSuitcaseRolling } from "react-icons/fa";
import { fetchUserBookings, deleteBooking } from "../../store/bookings";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";
import "./TripsPage.css";

function TripsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.session.user);
    const bookings = useSelector((state) => state.bookings.bookings || []);

    useEffect(() => {
        if (!user) {
            navigate("/", {
                state: { error: "You must be logged in to view your trips" },
                replace: true,
            });
            return;
        }
        dispatch(fetchUserBookings());
    }, [dispatch, user, navigate]);

    if (!user) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [...bookings]
        .filter((b) => new Date(b.startDate) >= today)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const past = [...bookings]
        .filter((b) => new Date(b.startDate) < today)
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    const handleCancel = async (booking) => {
        try {
            await dispatch(deleteBooking(booking.id));
            toast.success("Trip cancelled.");
        } catch {
            toast.error("Couldn't cancel this trip. Please try again.");
        }
    };

    const renderBooking = (booking, cancellable) => (
        <div className="trip-card" key={booking.id}>
            <Link to={`/spots/${booking.spotId}`} className="trip-card-image">
                <img
                    src={booking.Spot?.previewImage}
                    alt={booking.Spot?.name}
                    loading="lazy"
                />
            </Link>
            <div className="trip-card-body">
                <Link to={`/spots/${booking.spotId}`} className="trip-card-name">
                    {booking.Spot?.name}
                </Link>
                <p className="trip-card-location">
                    {booking.Spot?.city}, {booking.Spot?.state}
                </p>
                <p className="trip-card-dates">
                    {booking.startDate} &ndash; {booking.endDate}
                </p>
                {cancellable && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCancel(booking)}
                    >
                        Cancel trip
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <div className="trips-page">
            <h1>My Trips</h1>
            {bookings.length === 0 ? (
                <EmptyState
                    icon={<FaSuitcaseRolling />}
                    title="No trips booked yet"
                    message="When you book a stay, it'll show up here."
                />
            ) : (
                <>
                    <section className="trips-section">
                        <h2>Upcoming</h2>
                        {upcoming.length === 0 ? (
                            <p className="trips-section-empty">
                                No upcoming trips.
                            </p>
                        ) : (
                            <div className="trips-list">
                                {upcoming.map((b) => renderBooking(b, true))}
                            </div>
                        )}
                    </section>
                    <section className="trips-section">
                        <h2>Past</h2>
                        {past.length === 0 ? (
                            <p className="trips-section-empty">
                                No past trips yet.
                            </p>
                        ) : (
                            <div className="trips-list">
                                {past.map((b) => renderBooking(b, false))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default TripsPage;
