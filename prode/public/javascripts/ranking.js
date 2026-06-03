import { elements, state, escapeHtml } from "./shared.js";

export function renderRanking() {
  elements.rankingList.innerHTML = state.leaderboard
    .map(
      (row, index) => `
        <article class="ranking-row">
          <span class="rank-number">${index + 1}</span>
          <div class="rank-info">
            <strong>${escapeHtml(row.name)}</strong>
            <span>${row.hits} aciertos con puntos sobre ${row.played} partidos finalizados</span>
          </div>
          <strong class="points">${row.points} pts</strong>
        </article>
      `,
    )
    .join("");
}
