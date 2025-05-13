const apiUrl = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const filmList = document.getElementById('filmList');

  async function fetchFilms() {
    const res = await fetch('http://localhost:3000/films');
    const films = await res.json();

    filmList.innerHTML = '';

    films.forEach(film => {
      const card = document.createElement('div');
      card.className = 'col-md-4 mb-4';
      card.innerHTML = `
        <div class="card h-100 text-white">
          <img src="http://localhost:3000/uploads/images/${film.image}" class="card-img-top" alt="${film.title}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${film.title}</h5>
            <p class="card-text">${film.description}</p>
            <p class="card-text"><small>Kategória: ${film.category} | Hossz: ${film.time} perc</small></p>
            ${film.video ? `
              <video controls class="mt-2">
                <source src="http://localhost:3000/uploads/videos/${film.video}" type="video/mp4">
              </video>` : ''}
          </div>
        </div>
      `;
      filmList.appendChild(card);
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const res = await fetch('http://localhost:3000/films', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      form.reset();
      fetchFilms();
    } else {
      alert('Hiba történt a feltöltés során.');
    }
  });

  fetchFilms();
});


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("filmForm");
  const filmList = document.getElementById("filmList");
  const formContainer = document.getElementById("formContainer");
  const showFormBtn = document.getElementById("showFormBtn");

  showFormBtn.addEventListener("click", () => {
    formContainer.style.display = formContainer.style.display === "none" ? "block" : "none";
  });

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
      const films = await res.json();
      filmList.innerHTML = "";

      films.forEach((film) => {
        const col = document.createElement("div");
        col.className = "col-md-4";

        col.innerHTML = `
          <div class="card">
            <img src="http://localhost:3000/uploads/images/${film.image}" class="card-img-top" alt="${film.title}">
            <div class="card-body">
              <h5 class="card-title">${film.title}</h5>
              <p class="card-text">${film.description}</p>
              <p><strong>Kategória:</strong> ${film.category} | <strong>Hossz:</strong> ${film.time} perc</p>
              <video controls width="100%" height="200" src="http://localhost:3000/uploads/videos/${film.video}"></video>
            </div>
          </div>
        `;
        filmList.appendChild(col);
      });
    } catch (err) {
      console.error("Hiba filmek betöltésekor:", err);
    }
  }

  loadFilms();
});



document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const showFormBtn = document.getElementById("showFormBtn");
  const filmsContainer = document.getElementById("filmsContainer");

  showFormBtn.addEventListener("click", () => {
    form.style.display = form.style.display === "none" ? "block" : "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const response = await fetch("http://localhost:3000/films", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("Film sikeresen feltöltve!");
      form.reset();
      form.style.display = "none";
      fetchFilms();
    } else {
      alert("Hiba történt a feltöltés során.");
    }
  });

  async function fetchFilms() {
    const res = await fetch("http://localhost:3000/films");
    const films = await res.json();

    filmsContainer.innerHTML = "";
    films.forEach(film => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";

      col.innerHTML = `
        <div class="card h-100 bg-secondary text-light shadow">
          <img src="http://localhost:3000/uploads/${film.image}" class="card-img-top" alt="${film.title}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${film.title}</h5>
            <p class="card-text">${film.description || ''}</p>
            <p class="card-text"><small class="text-muted">Kategória: ${film.category}</small></p>
            <p class="card-text"><small class="text-muted">Hossz: ${film.time} perc</small></p>
            <video src="http://localhost:3000/uploads/${film.video}" class="w-100 mt-2" controls></video>
            <button class="btn btn-danger mt-3 delete-btn" data-id="${film.id}">🗑 Törlés</button>
          </div>
        </div>
      `;
      filmsContainer.appendChild(col);
    });

    setTimeout(() => {
      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          if (confirm("Biztosan törlöd ezt a filmet?")) {
            const del = await fetch(`http://localhost:3000/films/${id}`, { method: "DELETE" });
            if (del.ok) {
              fetchFilms();
            } else {
              alert("Hiba a törlés során.");
            }
          }
        });
      });
    }, 100);
  }

  fetchFilms();
});


loadFilms();
