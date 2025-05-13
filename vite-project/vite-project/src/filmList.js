export function renderFilmList(films, deleteFilm) {
  const container = document.getElementById('film-list');
  container.innerHTML = '';

  if (films.length === 0) {
    container.innerHTML = '<p>Nincs találat.</p>';
    return;
  }

  films.forEach(film => {
    const card = document.createElement('div');
    card.className = 'film-card';
    card.innerHTML = `
      <h3>${film.title}</h3>
      <p>${film.description}</p>
      <small>Hossza: ${film.time} perc</small><br>
      <small>Kategória: ${film.category}</small>
      <button class="delete-btn" data-id="${film.id}">Törlés</button>
    `;
    container.appendChild(card);

    card.querySelector('.delete-btn').addEventListener('click', e => {
      const filmId = parseInt(e.target.dataset.id);
      deleteFilm(filmId);
    });
  });
}
