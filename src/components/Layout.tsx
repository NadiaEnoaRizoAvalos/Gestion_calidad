import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Heart, Home, Sparkles } from "lucide-react";
import { assets } from "../data/assets";
import { useStudy } from "../hooks/useStudy";

const navigation = [
  ["/teoria", "Teoría"],
  ["/procesos", "Procesos"],
  ["/parciales", "Parciales"],
  ["/repaso", "Repaso"],
  ["/ruta", "Mi ruta"],
];

export function Layout() {
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const initial = useRef(true);
  const { storageError } = useStudy();
  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    main.current?.focus();
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div
      className={`library ${location.pathname === "/" ? "library-home" : "library-inner"}`}
    >
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <div className="room-decor" aria-hidden="true">
        <div className="room-corner">
          <div className="window">
            <span className="window-sun" />
            <span className="window-cloud" />
          </div>
          <img className="window-plant" src={assets.leaves} alt="" />
          <div className="wall-shelf">
            <i />
            <i />
            <i />
          </div>
          {location.pathname === "/" && (
            <img className="resting-bunny" src={assets.resting} alt="" />
          )}
        </div>
      </div>
      <header className="site-header">
        <Link className="home-pill" to="/">
          <Home size={16} fill="currentColor" /> Inicio
        </Link>
        <div className="brand">
          <div>
            <Link to="/" className="brand-title">
              Gestión de <em>Calidad</em>
            </Link>
            <p>Estudia · Practica · Repasa · Avanza</p>
            <div className="brand-divider">
              <span />
              <Heart size={13} />
              <span />
            </div>
          </div>
        </div>
      </header>
      {location.pathname !== "/" && (
        <nav className="module-nav" aria-label="Secciones de estudio">
          {navigation.map(([path, label]) => (
            <NavLink key={path} to={path}>
              {label}
            </NavLink>
          ))}
        </nav>
      )}
      {storageError && (
        <p className="storage-alert" role="alert">
          No se pudo guardar en este navegador. Tu progreso actual solo se
          conservará mientras mantengas abierta la página.
        </p>
      )}
      <main id="contenido" ref={main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <Sparkles size={14} />
        <span>Un poquito cada día, un gran paso en tu aprendizaje.</span>
        <Heart size={13} />
      </footer>
    </div>
  );
}
