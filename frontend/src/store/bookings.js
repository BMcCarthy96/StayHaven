import { csrfFetch } from "./csrf";

// Thunk to fetch bookings for a specific spot
export const fetchSpotBookings = (spotId) => async () => {
    const response = await csrfFetch(`/api/spots/${spotId}/bookings`);
    const data = await response.json();
    return data.Bookings;
};

const LOAD_USER_BOOKINGS = "bookings/LOAD_USER_BOOKINGS";
const REMOVE_BOOKING = "bookings/REMOVE_BOOKING";

const loadUserBookings = (bookings) => ({
    type: LOAD_USER_BOOKINGS,
    bookings,
});

const removeBooking = (bookingId) => ({
    type: REMOVE_BOOKING,
    bookingId,
});

export const fetchUserBookings = () => async (dispatch) => {
    const response = await csrfFetch("/api/bookings/current");
    const data = await response.json();
    dispatch(loadUserBookings(data.Bookings));
};

export const createBooking = (spotId, { startDate, endDate }) => async () => {
    const response = await csrfFetch(`/api/spots/${spotId}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
    });
    return response.json();
};

export const deleteBooking = (bookingId) => async (dispatch) => {
    await csrfFetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
    dispatch(removeBooking(bookingId));
};

const initialState = { bookings: [] };

export default function bookingsReducer(state = initialState, action) {
    switch (action.type) {
        case LOAD_USER_BOOKINGS:
            return { ...state, bookings: action.bookings };
        case REMOVE_BOOKING:
            return {
                ...state,
                bookings: state.bookings.filter((b) => b.id !== action.bookingId),
            };
        default:
            return state;
    }
}
