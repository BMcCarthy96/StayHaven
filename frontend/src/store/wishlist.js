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

const initialState = { spots: [] };

export default function wishlistReducer(state = initialState, action) {
    switch (action.type) {
        case LOAD_WISHLIST:
            return { ...state, spots: action.spots };
        default:
            return state;
    }
}
