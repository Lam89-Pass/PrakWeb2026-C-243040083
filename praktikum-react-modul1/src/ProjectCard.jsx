import { useRef } from "react";
import { ArrowIcon, GithubIcon } from "./icons";
import { projectIcons } from "./iconsBaru";

function ProjectCard({ project, lang, repoLabel, index }) {
  const ref = useRef(null);
  const title = project.title[lang];
  const desc = project.desc[lang];

  const handleMove = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--rx", x - 0.5);
    el.style.setProperty("--ry", y - 0.5);
  };

  const handleLeave = () => {
    ref.current.style.setProperty("--rx", 0);
    ref.current.style.setProperty("--ry", 0);
  };

  return (
    <article ref={ref} className="card" style={{ "--d": `${200 + Math.min(index, 6) * 100}ms` }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div className="card-inner">
        <div className="card-icon">{projectIcons[project.icon]}</div>

        <div className="swap" key={lang}>
          <h3 className="card-title">{title}</h3>
          <p className="card-desc">{desc}</p>
        </div>

        <ul className="tags" dir="ltr">
          {project.tags.map((tag) => (
            <li key={tag} className="tag">
              #{tag}
            </li>
          ))}
        </ul>

        <a className="repo" href={project.repo} target="_blank" rel="noreferrer">
          <GithubIcon />
          <span className="swap" key={lang}>
            {repoLabel}
          </span>
          <span className="repo-arrow">
            <ArrowIcon />
          </span>
        </a>
      </div>
    </article>
  );
}

export default ProjectCard;
