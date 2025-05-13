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

    const imageUrl = film.image ? `http://localhost:3000/uploads/images/${film.image}` : '';
    const videoUrl = film.video ? `http://localhost:3000/uploads/videos/${film.video}` : '';

    card.innerHTML = `
      <h3>${film.title}</h3>
      <p>${film.description}</p>
      <small>Hossz: ${film.time} perc</small><br>
      <small>Kategória: ${film.category}</small><br>
      ${imageUrl ? `<img src="${imageUrl}" alt="Film kép" width="200"/>` : ''}
      ${videoUrl ? `<video src="${videoUrl}" width="320" controls></video>` : ''}
      <button class="delete-btn" data-id="${film.id}">Törlés</button>
    `;

    container.appendChild(card);

    card.querySelector('.delete-btn').addEventListener('click', () => {
      deleteFilm(film.id);
    });
  });
}
