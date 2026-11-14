import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Heart, Home, Sparkles } from "lucide-react";
import { assets } from "../data/assets";
import { useStudy } from "../hooks/useStudy";

const navigation = [
  ["/teoria", "Teoría"],
  ["/simulador", "Simulador"],
  ["/procesos", "Procesos"],
  ["/parciales", "Parciales"],
  ["/apuntes", "Apuntes"],
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
        <div className="window">
          <span />
          <span />
        </div>
        <img className="hanging-leaves" src={assets.leaves} alt="" />
        <div className="hanging-star">✧</div>
        <div className="cloud cloud-one" />
        <div className="cloud cloud-two" />
        <span className="star star-one">✦</span>
        <span className="star star-two">✧</span>
        <span className="star star-three">✦</span>
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
        <img className="resting-bunny" src={assets.resting} alt="" />
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
      <img className="reading-bunny" src={assets.reading} alt="" />
      <div className="bottom-clouds" aria-hidden="true" />
    </div>
  );
}
