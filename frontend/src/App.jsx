import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer/Footer";
import * as sessionActions from "./store/session";
import LoginFormModal from "./components/LoginFormModal";
import SignupFormModal from "./components/SignupFormModal";
import LandingPage from "./components/LandingPage";
import UserProfile from "./components/UserProfile";
import { fetchSpots } from "./store/spots";
import SpotDetails from "./components/SpotDetails";
import CreateSpot from "./components/CreateSpot";
import ManageSpots from "./components/ManageSpots";
import UpdateSpot from "./components/UpdateSpot";
import ManageReviews from "./components/ManageReviews";
import SearchResults from "./components/SearchResults";
import WishlistPage from "./components/WishlistPage";
import TripsPage from "./components/TripsPage";
import NotFound from "./components/NotFound";

function Layout() {
    const dispatch = useDispatch();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        dispatch(sessionActions.restoreUser()).then(() => {
            dispatch(fetchSpots());
            setIsLoaded(true);
        });
    }, [dispatch]);

    return (
        <>
            <Navigation isLoaded={isLoaded} />
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="page-content">{isLoaded && <Outlet />}</div>
            <Footer />
        </>
    );
}

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <LandingPage />,
            },
            {
                path: "/search",
                element: <SearchResults />,
            },
            {
                path: "/login",
                element: <LoginFormModal />,
            },
            {
                path: "/signup",
                element: <SignupFormModal />,
            },
            {
                path: "/spots/new",
                element: <CreateSpot />,
            },
            {
                path: "/host/spots",
                element: <ManageSpots />,
            },
            {
                path: "/spots/:spotId",
                element: <SpotDetails />,
            },
            {
                path: "/spots/:spotId/edit",
                element: <UpdateSpot />,
            },
            {
                path: "/host/reviews",
                element: <ManageReviews />,
            },
            {
                path: "/profile",
                element: <UserProfile />,
            },
            {
                path: "/wishlist",
                element: <WishlistPage />,
            },
            {
                path: "/trips",
                element: <TripsPage />,
            },
            {
                path: "*",
                element: <NotFound />,
            },
        ],
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
