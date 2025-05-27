import "./NotFound.css";

export default function NotFound() {
    return (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
            <h1>404 - Page Not Found</h1>
            <p>Sorry, we couldn&apos;t find that page.</p>
            <a href="/" className="save-btn">
                Go Home
            </a>
        </div>
    );
}
