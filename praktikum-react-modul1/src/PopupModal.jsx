import { useEffect, useRef } from "react";
import { CheckIcon } from "./iconsBaru";

function PopupModal({ open, onClose, title, message, closeLabel }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const sebelumnya = document.activeElement;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    btnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      sebelumnya?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
        <span className="modal-glow" aria-hidden="true" />
        <div className="modal-icon">
          <CheckIcon />
        </div>
        <h3 id="modal-title">{title}</h3>
        <p id="modal-desc">{message}</p>
        <button ref={btnRef} type="button" className="modal-btn" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </div>
  );
}

export default PopupModal;
