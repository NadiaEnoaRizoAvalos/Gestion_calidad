import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Heart, Home, Sparkles, BookOpen, Workflow, ClipboardList, Brain, Map, Menu,
} from "lucide-react";
import { assets } from "../data/assets";
import { useStudy } from "../hooks/useStudy";
import "../styles/app-shell.css";

const navigation = [
  { path: "/", label: "Inicio", icon: Home },
  { path: "/teoria", label: "Teoría", icon: BookOpen },
  { path: "/procesos", label: "Procesos y BPMN", icon: Workflow },
  { path: "/parciales", label: "Parciales", icon: ClipboardList },
  { path: "/repaso", label: "Apoyo inteligente", icon: Brain },
  { path: "/ruta", label: "Ruta de estudio", icon: Map },
];

export function Layout() {
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const initial = useRef(true);
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1101px)");
    const adaptMenu = () => {
      if (menu.current) menu.current.open = desktop.matches;
    };
    adaptMenu();
    desktop.addEventListener("change", adaptMenu);
    return () => desktop.removeEventListener("change", adaptMenu);
  }, []);
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
    <div className="app-shell">
      <a
        href="#contenido"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
          main.current?.scrollIntoView();
        }}
      >
        Saltar al contenido
      </a>
      <aside className="sidebar" aria-label="Tu biblioteca de estudio">
        <div className="sidebar-brand">
          <img src={assets.theory} alt="" width={64} height={64} />
          <span>
            Mi biblioteca<small>Gestión de Calidad</small>
          </span>
        </div>
        <details className="sidebar-menu" ref={menu}>
          <summary>
            <Menu size={20} aria-hidden="true" /> Menú de estudio
          </summary>
          <nav className="sidebar-nav" aria-label="Secciones de estudio">
            {navigation.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                title={label}
                onClick={() => {
                  if (menu.current && !window.matchMedia("(min-width: 1101px)").matches) {
                    menu.current.open = false;
                  }
                }}
              >
                <Icon size={20} aria-hidden="true" /><span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </details>
      </aside>
      <div className={`library ${location.pathname === "/" ? "library-home" : "library-inner"}`}>
        {location.pathname !== "/" && (
          <div className="room-decor" aria-hidden="true">
            <div className="room-corner">
              <div className="window">
                <span className="window-sun" />
                <span className="window-cloud" />
              </div>
              <img className="window-plant" src={assets.leaves} alt="" />
              <div className="wall-shelf"><i /><i /><i /></div>
            </div>
          </div>
        )}
        <header className="site-header">
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
          {location.pathname === "/" && (
            <img className="resting-bunny" src={assets.resting} alt="" />
          )}
        </header>
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
    </div>
  );
}
