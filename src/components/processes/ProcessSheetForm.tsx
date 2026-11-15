import { sheetFields } from "../../data/processes/content";
import { certificateSheet } from "../../data/processes/examples";
import type { ProcessSheet } from "../../types/processLab";
export function ProcessSheetForm({
  sheet,
  onChange,
}: {
  sheet: ProcessSheet;
  onChange: (sheet: ProcessSheet) => void;
}) {
  return (
    <details className="panel lab-sheet">
      <summary>Caracterización · Ficha de proceso editable</summary>
      <p>
        Diapositivas 33–37. Guardá el mapa para conservar también esta ficha.
      </p>
      <button
        className="secondary"
        onClick={() => {
          if (
            window.confirm(
              "¿Reemplazar la ficha actual por el ejemplo de Certificados de Calidad?",
            )
          )
            onChange({ ...certificateSheet });
        }}
      >
        Cargar ejemplo de certificados
      </button>
      <div className="lab-two-columns">
        <form onSubmit={(e) => e.preventDefault()}>
          {sheetFields.map(([key, label]) => (
            <label key={key}>
              {label}
              <textarea
                maxLength={5000}
                rows={key === "activities" ? 4 : 2}
                value={sheet[key]}
                onChange={(e) => onChange({ ...sheet, [key]: e.target.value })}
              />
            </label>
          ))}
        </form>
        <section aria-label="Vista previa de la ficha">
          <h3>{sheet.name || "Vista previa de la ficha"}</h3>
          <dl>
            {sheetFields.slice(1).map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{sheet[key] || "Por completar"}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </details>
  );
}
