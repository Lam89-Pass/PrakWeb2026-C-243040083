import { useState } from "react";
import { UserIcon, icons } from "./icons";
import { IdIcon, StatusIcon } from "./iconsBaru";

function KartuProfil({ nama, role, npm, kelas, status, aktif, labels, fotoUrl }) {
  const [fotoGagal, setFotoGagal] = useState(false);

  return (
    <div className="profile">
      <div className="profile-head">
        <div className="avatar-ring">
          <div className="avatar">{fotoUrl && !fotoGagal ? <img src={fotoUrl} alt={nama} onError={() => setFotoGagal(true)} /> : <UserIcon />}</div>
        </div>
        <div className="profile-id">
          <h3 className="profile-name">{nama}</h3>
          <p className="profile-role">{role}</p>
        </div>
      </div>

      <ul className="profile-details">
        <li className="pd-row">
          <span className="contact-ico">
            <IdIcon />
          </span>
          <span className="contact-txt">
            <span className="contact-label">{labels.npm}</span>
            <span className="contact-value" dir="ltr">
              {npm}
            </span>
          </span>
        </li>
        <li className="pd-row">
          <span className="contact-ico">{icons.academic}</span>
          <span className="contact-txt">
            <span className="contact-label">{labels.kelas}</span>
            <span className="contact-value" dir="ltr">
              {kelas}
            </span>
          </span>
        </li>
        <li className="pd-row">
          <span className="contact-ico">
            <StatusIcon />
          </span>
          <span className="contact-txt">
            <span className="contact-label">{labels.status}</span>
            <span className={`status ${aktif ? "is-active" : "is-idle"}`}>
              <span className="status-dot" />
              {status}
            </span>
          </span>
        </li>
      </ul>
    </div>
  );
}

export default KartuProfil;