const apiUrl = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("filmForm");
  const filmList = document.getElementById("filmList");
  const formContainer = document.getElementById("formContainer");
  const showFormBtn = document.getElementById("showFormBtn");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  let allFilms = [];
  let filteredFilms = [];

  showFormBtn.addEventListener("click", () => {
    formContainer.style.display = formContainer.style.display === "none" ? "block" : "none";
  });

  searchInput.addEventListener("input", filterFilms);
  categoryFilter.addEventListener("change", filterFilms);

  function filterFilms() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    filteredFilms = allFilms.filter(film => {
      const matchesSearch = film.title.toLowerCase().includes(searchTerm) ||
                          film.description.toLowerCase().includes(searchTerm);
      const matchesCategory = !selectedCategory || film.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    renderFilms(filteredFilms);
  }

  function showFilmDetails(film) {
    const modalHtml = `
      <div class="modal fade" id="filmModal${film.id}" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content bg-dark text-white">
            <div class="modal-header border-secondary">
              <h5 class="modal-title">${film.title}</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <img src="http://localhost:3000/uploads/images/${film.image}" class="img-fluid rounded" alt="${film.title}">
                </div>
                <div class="col-md-6">
                  <p class="mb-3">${film.description}</p>
                  <p><strong>Kategória:</strong> ${film.category}</p>
                  <p><strong>Hossz:</strong> ${film.time} perc</p>
                </div>
              </div>
              ${film.video ? `
                <div class="mt-4">
                  <video controls class="w-100">
                    <source src="http://localhost:3000/uploads/videos/${film.video}" type="video/mp4">
                  </video>
                </div>` : ''}
              <div class="text-end mt-3">
                <button class="delete-btn" data-id="${film.id}">🗑️ Törlés</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (!document.querySelector(`#filmModal${film.id}`)) {
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    const modal = new bootstrap.Modal(document.querySelector(`#filmModal${film.id}`));
    modal.show();

    const deleteBtn = document.querySelector(`#filmModal${film.id} .delete-btn`);
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Biztosan törölni szeretnéd ezt a filmet?')) {
        try {
          const response = await fetch(`http://localhost:3000/films/${film.id}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            modal.hide();
            loadFilms();
          } else {
            alert('Hiba történt a film törlésekor.');
          }
        } catch (error) {
          console.error('Hiba:', error);
          alert('Hiba történt a film törlésekor.');
        }
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch("http://localhost:3000/films", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Hiba történt");
      form.reset();
      formContainer.style.display = "none";
      loadFilms();
    } catch (err) {
      alert("Hiba feltöltéskor: " + err.message);
    }
  });

  async function loadFilms() {
    try {
      const res = await fetch("http://localhost:3000/films");
      allFilms = await res.json();
      filterFilms();
    } catch (err) {
      console.error("Hiba filmek betöltésekor:", err);
      filmList.innerHTML = '<div class="col-12"><p class="text-center text-white">Hiba történt a filmek betöltésekor.</p></div>';
    }
  }

  function renderFilms(films) {
    filmList.innerHTML = "";

    if (films.length === 0) {
      filmList.innerHTML = '<div class="col-12"><p class="text-center text-white">Nincs találat a keresési feltételeknek megfelelően.</p></div>';
      return;
    }

    films.forEach((film) => {
      const col = document.createElement("div");
      col.className = "col-md-3 mb-4";

      col.innerHTML = `
        <div class="card h-100 text-white film-card" role="button">
          <img src="http://localhost:3000/uploads/images/${film.image}" class="card-img-top" alt="${film.title}">
          <div class="card-body">
            <h5 class="card-title text-center">${film.title}</h5>
          </div>
        </div>
      `;

      col.querySelector('.film-card').addEventListener('click', () => showFilmDetails(film));
      filmList.appendChild(col);
    });
  }

  loadFilms();
});
