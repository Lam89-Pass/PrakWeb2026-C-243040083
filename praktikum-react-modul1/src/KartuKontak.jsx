import { GithubIcon } from "./icons";
import { MailIcon, InstagramIcon, LinkedinIcon, ExternalIcon } from "./iconsBaru";

const kontak = [
  { key: "email", label: "Email", value: "aaallaaamm03@gmail.com", href: "mailto:aaallaaamm03@gmail.com", icon: <MailIcon /> },
  { key: "instagram", label: "Instagram", value: "@lam.xyz_", href: "https://instagram.com/lam.xyz_", icon: <InstagramIcon /> },
  { key: "github", label: "GitHub", value: "Lam89-Pass", href: "https://github.com/Lam89-Pass", icon: <GithubIcon size={20} /> },
  { key: "linkedin", label: "LinkedIn", value: "muhamadnursalam", href: "https://www.linkedin.com/in/muhamadnursalam", icon: <LinkedinIcon /> },
];

function KartuKontak({ title }) {
  return (
    <aside className="contact-card">
      <h3 className="contact-title">{title}</h3>
      <ul className="contact-list">
        {kontak.map((k) => (
          <li key={k.key}>
            <a className="contact-link" href={k.href} target={k.key === "email" ? undefined : "_blank"} rel="noreferrer">
              <span className="contact-ico">{k.icon}</span>
              <span className="contact-txt">
                <span className="contact-label">{k.label}</span>
                <span className="contact-value" dir="ltr">
                  {k.value}
                </span>
              </span>
              <span className="contact-arrow">
                <ExternalIcon />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default KartuKontak;