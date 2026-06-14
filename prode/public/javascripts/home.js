import { elements, state, matchDateText, stageLabel } from "./shared.js";

let carouselIndex = 0;
let carouselTimer = null;

export function renderSummary() {
  renderCarousel();
}

export function setupCarousel() {
  const slides = getSummarySlides();
  carouselIndex = Math.min(carouselIndex, Math.max(slides.length - 1, 0));
  renderCarousel();
  if (carouselTimer) window.clearInterval(carouselTimer);
  carouselTimer = window.setInterval(() => {
    const slidesList = getSummarySlides();
    if (!slidesList.length) return;
    carouselIndex = (carouselIndex + 1) % slidesList.length;
    renderCarousel();
  }, 4200);
}

function renderCarousel() {
  const slides = getSummarySlides();
  const slide = slides[carouselIndex % slides.length] || {
    kicker: "Resumen",
    value: "Cargando...",
    meta: "Preparando el prode.",
  };

  elements.summaryKicker.textContent = slide.kicker;
  elements.summaryDate.textContent = slide.date || "";
  elements.summaryDate.classList.toggle("hidden", !slide.date);
  elements.summaryValue.textContent = slide.value;
  elements.summaryMeta.textContent = slide.meta;
  elements.summaryDots.innerHTML = slides
    .map((_, index) => `<span class="${index === carouselIndex ? "active" : ""}"></span>`)
    .join("");
}

function getSummarySlides() {
  const leader = state.leaderboard[0];
  const nextMatches = state.matches.filter((match) => match.unlocked && !match.final).slice(0, 3);
  const slides = [
    {
      kicker: "Jugadores",
      value: String(state.summary.totalPlayers ?? 0),
      meta: "Participantes cargados en el prode.",
    },
    {
      kicker: "Partidos abiertos",
      value: String(state.summary.openMatches ?? 0),
      meta: "Disponibles para cargar pronosticos.",
    },
    {
      kicker: "Lider actual",
      value: leader ? `${leader.name} · ${leader.points} pts` : "Sin lider",
      meta: leader ? `${leader.hits} aciertos sobre ${leader.played} finalizados.` : "El ranking se activa con resultados.",
    },
  ]; 

  nextMatches.forEach((match, index) => {
    slides.push({
      kicker: index === 0 ? "Proximo partido" : "Tambien abierto",
      value: `${match.home} vs ${match.away}`,
      meta: `${matchDateText(match)} · ${stageLabel(match)}${match.group ? ` · Grupo ${match.group}` : ""}`,
      date: matchDateText(match),
    });
  });

  slides.push({
    kicker: "Finalizados",
    value: String(state.summary.finishedMatches ?? 0),
    meta: "Resultados oficiales ya bloqueados.",
  });

  return slides;
}
