import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  Target,
  ChevronRight,
  Check,
  Map,
  Lightbulb,
  Heart,
  Settings2,
  Sparkles,
} from "lucide-react";
import { assets } from "../data/assets";
import { useStudy } from "../hooks/useStudy";
import { progress, weekCount } from "../hooks/studyStorage";
import { activities } from "../data/topics";

const modules = [
  {
    title: "Teoría",
    description: "Conceptos, definiciones y ejemplos para aprender.",
    image: "theory",
    path: "/teoria",
    note: "Entendé las bases",
  },
  {
    title: "Simulador SGC",
    description: "Aplicación práctica de la gestión de calidad.",
    image: "simulator",
    path: "/simulador",
    note: "Aprendé haciendo",
  },
  {
    title: "Procesos y BPMN",
    description: "Diagramas interactivos y explicaciones.",
    image: "processes",
    path: "/procesos",
    note: "Conectá las ideas",
  },
  {
    title: "Parciales",
    description: "Preguntas de práctica y autoevaluaciones.",
    image: "exams",
    path: "/parciales",
    note: "Ponete a prueba",
  },
  {
    title: "Apuntes de clase",
    description: "Explicaciones, ejemplos y observaciones.",
    image: "notes",
    path: "/apuntes",
    note: "Todo en un lugar",
  },
  {
    title: "Repaso inteligente",
    description:
      "Preguntas organizadas según los temas que necesitás reforzar.",
    image: "review",
    path: "/repaso",
    note: "Afianzá lo aprendido",
  },
] as const;
const tips = [
  "Aplicá lo aprendido con ejemplos reales. ¡La práctica te ayuda a consolidar mejor!",
  "Antes de proponer una mejora, preguntate qué evidencia explica el problema.",
  "Al terminar un tema, intentá explicarlo con tus propias palabras.",
  "Un proceso se entiende mejor cuando identificás sus entradas y sus salidas.",
];

export function Home() {
  const { state, setSchedule } = useStudy();
  const dialog = useRef<HTMLDialogElement>(null);
  const [date, setDate] = useState(state.nextStudy);
  const [goal, setGoal] = useState(state.weeklyGoal);
  const percent = progress(state);
  const weekly = weekCount(state);
  const next = activities.find((activity) => !state.completed[activity.id]);
  const [day] = useState(() => Math.floor(Date.now() / 86400000));
  return (
    <div className="dashboard">
      <section className="stats-grid" aria-label="Tu estudio en un vistazo">
        <Link to="/ruta" className="stat-card">
          <BarChart3 className="stat-icon" />
          <div>
            <h2>Tu progreso</h2>
            <div className="progress-row">
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Progreso general"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${percent}%` }} />
              </div>
              <strong>{percent}%</strong>
            </div>
            <small>
              {Object.keys(state.completed).length} de {activities.length}{" "}
              actividades
            </small>
          </div>
          <Sparkles className="tiny-spark" />
        </Link>
        <button
          className="stat-card schedule-card"
          onClick={() => {
            setDate(state.nextStudy);
            setGoal(state.weeklyGoal);
            dialog.current?.showModal();
          }}
        >
          <CalendarDays className="stat-icon" />
          <div>
            <h2>Próximo estudio</h2>
            <p>
              {state.nextStudy
                ? new Date(`${state.nextStudy}T12:00:00`).toLocaleDateString(
                    "es-AR",
                    { weekday: "short", day: "numeric", month: "short" },
                  )
                : "Elegí tu próximo momento"}
            </p>
            <small>
              Organizá tu tiempo <Settings2 size={11} />
            </small>
          </div>
        </button>
        <button
          className="stat-card goal-card"
          onClick={() => {
            setDate(state.nextStudy);
            setGoal(state.weeklyGoal);
            dialog.current?.showModal();
          }}
        >
          <Target className="stat-icon" />
          <div>
            <h2>Meta semanal</h2>
            <div className="goal-boxes" aria-hidden="true">
              {Array.from(
                { length: Math.min(state.weeklyGoal, 5) },
                (_, index) => (
                  <span key={index} className={index < weekly ? "checked" : ""}>
                    {index < weekly && <Check size={13} />}
                  </span>
                ),
              )}
              {state.weeklyGoal > 5 && <small>+{state.weeklyGoal - 5}</small>}
            </div>
            <small>
              {weekly} de {state.weeklyGoal} actividades · esta semana
            </small>
          </div>
        </button>
      </section>
      <section className="module-grid" aria-label="Tu biblioteca">
        {modules.map((module, index) => (
          <Link to={module.path} className="module-card" key={module.path}>
            <span className="card-corner corner-tl" aria-hidden="true">
              ❧
            </span>
            <span className="card-corner corner-br" aria-hidden="true">
              ❧
            </span>
            <div className="module-art">
              <img src={assets[module.image]} alt="" />
              <span className="art-shine" aria-hidden="true">
                ✧
              </span>
            </div>
            <div className="module-copy">
              <span className="module-number">CAPÍTULO 0{index + 1}</span>
              <h2>
                {index + 1}. {module.title}
              </h2>
              <p>{module.description}</p>
              <span className="module-note">{module.note}</span>
            </div>
            <span className="circle-arrow">
              <ChevronRight size={17} />
            </span>
          </Link>
        ))}
      </section>
      <section className="bottom-grid" aria-label="Seguí aprendiendo">
        <Link to="/ruta" className="route-card">
          <div className="route-art">
            <Map size={48} strokeWidth={1.2} />
            <span>✦</span>
          </div>
          <div>
            <h2>Ruta de estudio</h2>
            <p>
              {next
                ? "Sigue un orden sugerido para avanzar de forma organizada y efectiva."
                : "¡Completaste tu recorrido! Volvé a tus temas cuando quieras."}
            </p>
          </div>
          <span className="small-button">
            Ver ruta <ChevronRight size={13} />
          </span>
        </Link>
        <article className="tip-card">
          <Lightbulb className="bulb" size={49} strokeWidth={1.3} />
          <div>
            <h2>Consejito del día</h2>
            <p>
              {tips[day % tips.length]} <Heart size={11} />
            </p>
          </div>
          <div className="little-note" aria-hidden="true">
            ♡
          </div>
        </article>
      </section>
      <p className="home-caption">
        <Heart size={12} /> Tu espacio para aprender, a tu ritmo.
      </p>
      <dialog ref={dialog} className="settings-dialog">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSchedule(date, goal);
            dialog.current?.close();
          }}
        >
          <span className="eyebrow">UN MOMENTO PARA VOS</span>
          <h2>Organizá tu estudio</h2>
          <label>
            Próximo día de estudio
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <label>
            Actividades por semana
            <input
              type="number"
              min="1"
              max="20"
              required
              value={goal}
              onChange={(event) => setGoal(Number(event.target.value))}
            />
          </label>
          <p className="muted">
            La semana empieza el lunes. Cada actividad completada cuenta una
            vez.
          </p>
          <div className="actions">
            <button
              type="button"
              className="secondary"
              onClick={() => dialog.current?.close()}
            >
              Cancelar
            </button>
            <button className="primary" type="submit">
              Guardar preferencias
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
