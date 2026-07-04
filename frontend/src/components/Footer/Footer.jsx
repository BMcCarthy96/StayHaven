import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <Link to="/" className="site-footer-brand">
                    Stay Haven
                </Link>
                <p className="site-footer-tagline">
                    Find your next stay, anywhere in the world.
                </p>
                <p className="site-footer-meta">
                    © {year} Stay Haven · Built with React, Redux &amp; Express
                </p>
            </div>
        </footer>
    );
}

export default Footer;
