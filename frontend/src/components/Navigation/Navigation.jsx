import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import ThemeToggle from './ThemeToggle';
import { GiHouse } from "react-icons/gi";
import "./Navigation.css";

function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);

  return (
    <div>
      <nav className="navbar">
        <div className="nav-left">
          <NavLink to="/" className="home-logo">
            <GiHouse size={32} color="var(--color-primary)" />
          </NavLink>
          <NavLink to="/" className="title">Stay Haven</NavLink>
        </div>
        <div className="nav-right">
          {sessionUser && (
            <div className="new-spot-link">
              <NavLink to="/spots/new" className="create-link">
                Create a New Spot
              </NavLink>
            </div>
          )}
          <ThemeToggle />
          <div className="profile-btn-wrapper">
            {isLoaded && <ProfileButton user={sessionUser} />}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navigation;
