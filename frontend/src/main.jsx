import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import configureStore from "./store";
import { restoreCSRF, csrfFetch } from "./store/csrf";
import * as sessionActions from "./store/session";
import { ModalProvider, Modal } from "./context/Modal.jsx";
import * as spotActions from "./store/spots";

const store = configureStore();

if (import.meta.env.MODE !== "production") {
    restoreCSRF();

    window.global = window;
    window.csrfFetch = csrfFetch;
    window.store = store;
    window.sessionActions = sessionActions;
    window.spotActions = spotActions;
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ModalProvider>
            <Provider store={store}>
                <App />
                <Modal />
            </Provider>
        </ModalProvider>
    </React.StrictMode>
);
