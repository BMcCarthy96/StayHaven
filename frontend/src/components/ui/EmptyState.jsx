import "./primitives.css";

export default function EmptyState({ icon, title, message, action }) {
    return (
        <div className="empty-state">
            {icon && <div className="empty-state-icon">{icon}</div>}
            {title && <p className="empty-state-title">{title}</p>}
            {message && <p className="empty-state-message">{message}</p>}
            {action && <div className="empty-state-action">{action}</div>}
        </div>
    );
}
