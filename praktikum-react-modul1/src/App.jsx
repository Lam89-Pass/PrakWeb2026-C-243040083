import { useCallback, useEffect, useState } from "react";
import "./App.css";
import "./revisi.css";
import KartuProfil from "./KartuProfil";
import KartuKontak from "./KartuKontak";
import ProjectCard from "./ProjectCard";
import PopupModal from "./PopupModal";
import { languages, ui, projects } from "./i18n";
import { akademik, mahasiswa, daftarPraktikum } from "./akademik";
import { LayersIcon, ClockIcon, PointerIcon } from "./icons";
import LangDropdown from "./LangDropdown";

const NAMA_LENGKAP = "Muhamad Nursalam";
const FOTO_PROFIL = "/foto-profil.jpg";
const KELAS = "IF - C - Praktikum We";

function App() {
  const [lang, setLang] = useState("id");
  const [popup, setPopup] = useState(false);
  const t = ui[lang];
  const a = akademik[lang];
  const activeIndex = languages.findIndex((l) => l.code === lang);

  useEffect(() => {
    const current = languages[activeIndex];
    document.documentElement.lang = current.code;
    document.documentElement.dir = current.dir;
    document.title = a.heroTitle;
  }, [activeIndex, a]);

  const bukaPopup = () => setPopup(true);
  const tutupPopup = useCallback(() => setPopup(false), []);

  return (
    <div className="page">
      <div className="bg" aria-hidden="true">
        {/* <span className="orb orb-a" />
        <span className="orb orb-b" /> */}
      </div>

      <header className="topbar">
        <div className="brand">
          <span className="swap" key={lang}>
            {t.brand}
          </span>
        </div>

        <LangDropdown languages={languages} value={lang} onChange={setLang} label={t.langLabel} />
      </header>

      <main className="wrap">
        <section className="hero">
          <div className="swap" key={lang}>
            <h1 className="hero-title">{a.heroTitle}</h1>
            <p className="hero-sub">{a.heroSub}</p>
          </div>
        </section>

        <section className="block">
          <h2 className="sec-title">
            <span className="swap" key={lang}>
              {a.profileTitle}
            </span>
          </h2>
          <div className="profile-grid">
            <KartuProfil nama={NAMA_LENGKAP} role={t.role} npm={mahasiswa.npm} kelas={KELAS} status={a.statusValue} aktif={mahasiswa.aktif} fotoUrl={FOTO_PROFIL} labels={{ npm: a.npm, kelas: a.kelas, status: t.statusLabel }} />
            <KartuKontak title={t.contactTitle} />
          </div>
        </section>

        <section className="block">
          <h2 className="sec-title">
            <span className="swap" key={lang}>
              {a.listTitle}
            </span>
          </h2>
          <div className="courses">
            {daftarPraktikum.map((matkul, i) => (
              <div key={matkul.id} className="course" style={{ "--d": `${200 + i * 100}ms` }}>
                <div>
                  <div className="swap" key={lang}>
                    <span className="course-code">{matkul.kode}</span>
                    <span className="course-name"> - {matkul.nama[lang]}</span>
                  </div>
                  <div className="course-meta">
                    <ClockIcon />
                    <span className="swap" key={lang}>
                      {a.schedule}: {a.days[matkul.hari]}
                    </span>
                  </div>
                </div>
                <span className="sks swap" key={lang}>
                  {a.sks(matkul.sks)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="block">
          <h2 className="sec-title">
            <span className="swap" key={lang}>
              {a.showcaseTitle}
            </span>
            <span className="chip chip-inline">
              <span className="chip-dot" />
              <LayersIcon />
              <span className="swap" key={lang}>
                {t.count(projects.length)}
              </span>
            </span>
          </h2>
          <p className="section-sub swap" key={lang}>
            {t.subtitle}
          </p>
          <div className="grid">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} lang={lang} repoLabel={t.repo} index={i} />
            ))}
          </div>
        </section>

        <div className="event-wrap">
          <button type="button" className="event-btn" onClick={bukaPopup}>
            <PointerIcon />
            <span className="swap" key={lang}>
              {a.eventBtn}
            </span>
          </button>
        </div>
      </main>

      <footer className="footer">
        <span className="swap" key={lang}>
          {t.footer}
        </span>
      </footer>

      <PopupModal open={popup} onClose={tutupPopup} title={t.modalTitle} message={a.alert} closeLabel={t.modalClose} />
    </div>
  );
}

export default App;
