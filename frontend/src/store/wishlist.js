import { csrfFetch } from "./csrf";

const LOAD_WISHLIST = "wishlist/LOAD_WISHLIST";
const loadWishlist = (spots) => ({
    type: LOAD_WISHLIST,
    spots,
});

export const fetchWishlist = () => async (dispatch) => {
    const response = await csrfFetch("/api/wishlist/current");
    const data = await response.json();
    dispatch(loadWishlist(data.Spots));
};

export const addToWishlist = (spotId) => async (dispatch) => {
    await csrfFetch(`/api/wishlist/${spotId}`, { method: "POST" });
    dispatch(fetchWishlist());
};

export const removeFromWishlist = (spotId) => async (dispatch) => {
    await csrfFetch(`/api/wishlist/${spotId}`, { method: "DELETE" });
    dispatch(fetchWishlist());
};

const initialState = { spots: [] };

export default function wishlistReducer(state = initialState, action) {
    switch (action.type) {
        case LOAD_WISHLIST:
            return { ...state, spots: action.spots };
        default:
            return state;
    }
}
