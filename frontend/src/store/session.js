import { csrfFetch } from "./csrf";

// action creators
const SET_USER = "session/setUser";
// const REMOVE_USER = "session/removeUser";

const setUser = (user) => {
    return {
        type: SET_USER,
        payload: user,
    };
};

// const removeUser = () => {
//     return {
//         type: REMOVE_USER,
//     };
// };

export const login = (user) => async (dispatch) => {
    const { credential, password } = user;
    const response = await csrfFetch("/api/session", {
        method: "POST",
        body: JSON.stringify({
            credential,
            password,
        }),
    });

    if (response.ok) {
        const data = await response.json();
        dispatch(setUser(data.user));
        return response;
    } else {
        throw new Error("Login failed");
    }
};

// restore session user thunk action
export const restoreUser = () => async (dispatch) => {
    const response = await csrfFetch("/api/session");
    const data = await response.json();
    dispatch(setUser(data.user));
    return response;
};

// initial state
const initialState = { user: null };

// session reducer
const sessionReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_USER:
            return { ...state, user: action.payload };
        // case REMOVE_USER:
        //     return { ...state, user: null };
        default:
            return state;
    }
};

export default sessionReducer;
