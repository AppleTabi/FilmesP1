const apiUrl = 'http://localhost:3000';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("filmForm");
  const filmList = document.getElementById("filmList");
  const formContainer = document.getElementById("formContainer");
  const showFormBtn = document.getElementById("showFormBtn");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const imageInput = form.querySelector('input[name="image"]');
  const videoInput = form.querySelector('input[name="video"]');
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  updateUI();

  loginBtn.addEventListener('click', () => {
    loginModal.show();
  });

  registerBtn.addEventListener('click', () => {
    registerModal.show();
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateUI();
    loadFilms();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      handleLogin(data.user);
      loginModal.hide();
      loginForm.reset();
    } catch (error) {
      alert(error.message);
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      handleLogin(data.user);
      registerModal.hide();
      registerForm.reset();
    } catch (error) {
      alert(error.message);
    }
  });

  function handleLogin(user) {
    currentUser = user;
    updateUI();
  }

  function updateUI() {
    if (currentUser) {
      loginBtn.style.display = 'none';
      registerBtn.style.display = 'none';
      showFormBtn.style.display = 'block';
      logoutBtn.style.display = 'block';
    } else {
      loginBtn.style.display = 'block';
      registerBtn.style.display = 'block';
      showFormBtn.style.display = 'none';
      logoutBtn.style.display = 'none';
    }
  }

  let allFilms = [];
  let filteredFilms = [];

  showFormBtn.addEventListener("click", () => {
    formContainer.style.display = formContainer.style.display === "none" ? "block" : "none";
  });

  searchInput.addEventListener("input", filterFilms);
  categoryFilter.addEventListener("change", filterFilms);

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        alert('A képfájl mérete nem lehet nagyobb mint 5MB!');
        e.target.value = '';
      }
      if (!file.type.startsWith('image/')) {
        alert('Csak képfájlokat lehet feltölteni!');
        e.target.value = '';
      }
    }
  });

  videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_VIDEO_SIZE) {
        alert('A videófájl mérete nem lehet nagyobb mint 100MB!');
        e.target.value = '';
      }
      if (!file.type.startsWith('video/')) {
        alert('Csak videófájlokat lehet feltölteni!');
        e.target.value = '';
      }
    }
  });

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
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
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
      const response = await fetch(`${apiUrl}/films`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Hiba történt");
      }
      
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
