import { useEffect, useRef, useState } from "react";
import { GlobeIcon, ChevronIcon, CheckIcon } from "./iconsBaru";

function LangDropdown({ languages, value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const current = Math.max(0, languages.findIndex((l) => l.code === value));

  const buka = () => {
    setActive(current);
    setOpen(true);
  };
  const tutup = (kembali = true) => {
    setOpen(false);
    if (kembali) btnRef.current?.focus();
  };
  const pilih = (code) => {
    onChange(code);
    tutup();
  };

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const onListKey = (e) => {
    const n = languages.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + n) % n);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(n - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pilih(languages[active].code);
    } else if (e.key === "Escape") {
      e.preventDefault();
      tutup();
    } else if (e.key === "Tab") {
      tutup(false);
    }
  };

  const onBtnKey = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      buka();
    }
  };

  return (
    <div className={`dd${open ? " is-open" : ""}`} ref={rootRef}>
      <button ref={btnRef} type="button" className="dd-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => (open ? tutup() : buka())} onKeyDown={onBtnKey}>
        <GlobeIcon />
        <span className="dd-value" lang={languages[current].code}>
          {languages[current].label}
        </span>
        <span className="dd-chev">
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <ul ref={listRef} className="dd-list" role="listbox" tabIndex={-1} aria-label={label} aria-activedescendant={`dd-opt-${languages[active].code}`} onKeyDown={onListKey}>
          {languages.map((l, i) => (
            <li
              key={l.code}
              id={`dd-opt-${l.code}`}
              role="option"
              lang={l.code}
              aria-selected={l.code === value}
              className={`dd-opt${i === active ? " is-active" : ""}${l.code === value ? " is-selected" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => pilih(l.code)}
            >
              <span>{l.label}</span>
              {l.code === value && <CheckIcon size={16} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LangDropdown;