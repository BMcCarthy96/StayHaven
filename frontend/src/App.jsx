import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';
import * as sessionActions from './store/session';
import LoginFormModal from './components/LoginFormModal';
import SignupFormModal from './components/SignupFormModal';
import LandingPage from './components/LandingPage';
import {fetchSpots} from './store/spots'
import SpotDetails from './components/SpotDetails';
import CreateSpot from './components/CreateSpot';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      dispatch(fetchSpots())
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/login',
        element: <LoginFormModal />
      },
      {
        path: '/signup',
        element: <SignupFormModal />
      },
      {
        path: "/api/spots",
        element: <CreateSpot/>
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetails />
      },
      {
        path: '*',
        element: <h1>Page Not Found</h1>
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
