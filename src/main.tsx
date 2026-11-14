import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { StudyProvider } from "./hooks/StudyProvider";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Theory } from "./pages/Theory";
import { StudyRoute } from "./pages/StudyRoute";
import { Simulator } from "./pages/Simulator";
import { Processes } from "./pages/Processes";
import { NotFound } from "./pages/NotFound";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StudyProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="teoria" element={<Theory />} />
            <Route path="ruta" element={<StudyRoute />} />
            <Route path="simulador" element={<Simulator />} />
            <Route path="procesos" element={<Processes />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </StudyProvider>
  </StrictMode>,
);
