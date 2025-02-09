import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import { GiHouse } from "react-icons/gi";
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav className='navbar'>
      <div className='icon'>
        <NavLink to="/" className="home-logo"><GiHouse size={35} color="#000000"/></NavLink>
        <NavLink to="/" className="title">Stay Haven</NavLink>
      </div>

      <div className='profile-button'>
      {isLoaded && <ProfileButton user={sessionUser} />}
      </div>
    </nav>
  );
}

export default Navigation;
