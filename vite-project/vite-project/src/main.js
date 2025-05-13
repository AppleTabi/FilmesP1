import { initFilmForm } from './filmForm.js';
import { renderFilmList } from './filmList.js';
import { initCategoryFilter } from './categoryFilter.js';


let films = []
let searchTerm = ''
let selectedCategory = ''
const categories = ['Akció', 'Vígjáték', 'Dráma', 'Sci-fi']

document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/films')
    .then(response => response.json())
    .then(data => {
      films = data;
      refreshFilmList();
    })
    .catch(err => console.error('Hiba filmek lekérése közben:', err));

  document.getElementById('search').addEventListener('input', e => {
    searchTerm = e.target.value;
    refreshFilmList();
  });

  initFilmForm(film => {
    fetch('http://localhost:3000/films', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(film),
    })
      .then(response => response.json())
      .then(newFilm => {
        films.push(newFilm);
        refreshFilmList();
      })
      .catch(err => console.error('Hiba film feltöltése közben:', err));
  }, categories);

  initCategoryFilter(categories, selected => {
    selectedCategory = selected;
    refreshFilmList();
  });
});

function refreshFilmList() {
  const filtered = films.filter(film =>
    (film.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     film.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === '' || film.category === selectedCategory)
  );

  renderFilmList(filtered, deleteFilm);
}

function deleteFilm(filmId) {
  fetch(`http://localhost:3000/films/${filmId}`, {
    method: 'DELETE',
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        films = films.filter(film => film.id !== filmId);
        refreshFilmList();
      } else {
        alert('Hiba történt a film törlésekor');
      }
    })
    .catch(err => console.error('Hiba film törlése közben:', err));
}