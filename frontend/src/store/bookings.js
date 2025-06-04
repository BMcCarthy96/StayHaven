import { csrfFetch } from "./csrf";

// Thunk to fetch bookings for a specific spot
export const fetchSpotBookings = (spotId) => async () => {
    const response = await csrfFetch(`/api/spots/${spotId}/bookings`);
    const data = await response.json();
    return data.Bookings;
};

const LOAD_USER_BOOKINGS = "bookings/LOAD_USER_BOOKINGS";
const loadUserBookings = (bookings) => ({
    type: LOAD_USER_BOOKINGS,
    bookings,
});

export const fetchUserBookings = () => async (dispatch) => {
    const response = await csrfFetch("/api/bookings/current");
    const data = await response.json();
    dispatch(loadUserBookings(data.Bookings));
};

const initialState = { bookings: [] };

export default function bookingsReducer(state = initialState, action) {
    switch (action.type) {
        case LOAD_USER_BOOKINGS:
            return { ...state, bookings: action.bookings };
        default:
            return state;
    }
}
