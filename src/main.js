const apiUrl = 'http://localhost:3000';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

let currentUser = null;
let allFilms = [];
let filteredFilms = [];
let favoriteFilms = [];
let filteredFavoriteFilms = [];

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
  const adminPanelBtn = document.getElementById("adminPanelBtn");

  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
  const adminModal = new bootstrap.Modal(document.getElementById('adminModal'));

  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  }
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
    favoriteFilms = [];
    filteredFavoriteFilms = [];
    updateUI();
    loadFilms();
  });

  adminPanelBtn?.addEventListener('click', () => {
    loadAdminDashboard();
    adminModal.show();
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
    loadFavorites();
    loadFilms();
  }

  function updateUI() {
    const favoritesTabContainer = document.getElementById('favorites-tab-container');
    if (currentUser) {
      loginBtn.style.display = 'none';
      registerBtn.style.display = 'none';
      showFormBtn.style.display = 'block';
      logoutBtn.style.display = 'block';
      if (favoritesTabContainer) {
        favoritesTabContainer.style.display = 'block';
      }
      if (currentUser.role === 'admin') {
        adminPanelBtn.style.display = 'block';
      } else {
        adminPanelBtn.style.display = 'none';
      }
    } else {
      loginBtn.style.display = 'block';
      registerBtn.style.display = 'block';
      showFormBtn.style.display = 'none';
      logoutBtn.style.display = 'none';
      adminPanelBtn.style.display = 'none';
      if (favoritesTabContainer) {
        favoritesTabContainer.style.display = 'none';
        const favoritesTab = document.getElementById('favorites-tab');
        if (favoritesTab && favoritesTab.classList.contains('active')) {
          document.getElementById('all-films-tab').click();
        }
      }
    }
  }

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
                  ${currentUser ? `
                    <div class="d-flex gap-2 mb-3">
                      <button class="btn btn-outline-primary favorite-btn" data-id="${film.id}">
                        <i class="bi bi-heart"></i> Kedvencekhez adás
                      </button>
                      <div class="rating-container">
                        <div class="rating-stars">
                          ${[1, 2, 3, 4, 5].map(star => `
                            <i class="bi bi-star-fill rating-star" data-rating="${star}" data-film-id="${film.id}"></i>
                          `).join('')}
                        </div>
                        <div class="rating-info">
                          <span class="average-rating">0.0</span>
                          <small class="text-muted">(<span class="rating-count">0</span> értékelés)</small>
                        </div>
                      </div>
                    </div>
                  ` : `
                    <div class="alert alert-info">
                      Jelentkezz be a kedvencekhez adáshoz és értékeléshez!
                    </div>
                  `}
                </div>
              </div>
              ${film.video ? `
                <div class="mt-4">
                  <video controls class="w-100">
                    <source src="http://localhost:3000/uploads/videos/${film.video}" type="video/mp4">
                  </video>
                </div>` : ''}
              
              <div class="comments-section mt-4">
                <h5>Kommentek</h5>
                <div class="comments-list mb-3"></div>
                ${currentUser ? `
                  <form class="comment-form">
                    <div class="mb-3">
                      <textarea class="form-control" placeholder="Írj egy kommentet..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Küldés</button>
                  </form>
                ` : '<p>Jelentkezz be a kommenteléshez!</p>'}
              </div>

              ${currentUser && (currentUser.role === 'admin' || currentUser.id === film.userId) ? `
                <div class="text-end mt-3">
                  <button class="delete-btn" data-id="${film.id}">🗑️ Törlés</button>
                </div>
              ` : ''}
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

    const modalElement = document.querySelector(`#filmModal${film.id}`);
    const favoriteBtn = modalElement.querySelector('.favorite-btn');
    const ratingStars = modalElement.querySelectorAll('.rating-star');
    const commentsList = modalElement.querySelector('.comments-list');
    const commentForm = modalElement.querySelector('.comment-form');
    const averageRatingSpan = modalElement.querySelector('.average-rating');
    const ratingCountSpan = modalElement.querySelector('.rating-count');

    // Értékelések betöltése
    loadRatings(film.id);

    // Értékelés kezelése
    if (ratingStars) {
      ratingStars.forEach(star => {
        star.addEventListener('click', async () => {
          if (!currentUser) {
            alert('Jelentkezz be az értékeléshez!');
            return;
          }

          const rating = star.dataset.rating;
          try {
            const response = await fetch(`${apiUrl}/ratings/${film.id}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ rating })
            });
            
            if (!response.ok) {
              const error = await response.json();
              alert(error.error);
              return;
            }

            const data = await response.json();
            if (data.success) {
              updateRatingStars(rating);
              updateRatingInfo(data.averageRating, data.totalRatings);
            }
          } catch (error) {
            console.error('Hiba:', error);
          }
        });
      });
    }

    // Kommentek betöltése
    loadComments(film.id);

    // Komment form kezelése
    if (commentForm) {
      commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
          alert('Jelentkezz be a kommenteléshez!');
          return;
        }
        const content = commentForm.querySelector('textarea').value;
        
        try {
          const response = await fetch(`${apiUrl}/comments/${film.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
          });
          const comment = await response.json();
          
          if (comment) {
            addCommentToList(comment);
            commentForm.reset();
          }
        } catch (error) {
          console.error('Hiba:', error);
        }
      });
    }

    if (favoriteBtn) {
      const isFavorite = favoriteFilms.some(f => f.id === film.id);
      favoriteBtn.classList.toggle('active', isFavorite);
      favoriteBtn.innerHTML = `
        <i class="bi bi-heart${isFavorite ? '-fill' : ''}"></i>
        ${isFavorite ? 'Eltávolítás a kedvencekből' : 'Kedvencekhez adás'}
      `;
      
      favoriteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!currentUser) {
          alert('Jelentkezz be a kedvencekhez adáshoz!');
          return;
        }
        await toggleFavorite(film.id);
        const newIsFavorite = favoriteFilms.some(f => f.id === film.id);
        favoriteBtn.classList.toggle('active', newIsFavorite);
        favoriteBtn.innerHTML = `
          <i class="bi bi-heart${newIsFavorite ? '-fill' : ''}"></i>
          ${newIsFavorite ? 'Eltávolítás a kedvencekből' : 'Kedvencekhez adás'}
        `;
      });
    }
  }

  function updateRatingStars(rating) {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('text-warning');
      } else {
        star.classList.remove('text-warning');
      }
    });
  }

  async function loadRatings(filmId) {
    try {
      const response = await fetch(`${apiUrl}/ratings/${filmId}`);
      const data = await response.json();
      
      updateRatingInfo(data.averageRating, data.totalRatings);
      
      if (currentUser) {
        const userRating = data.ratings.find(r => r.userId === currentUser.id);
        if (userRating) {
          updateRatingStars(userRating.rating);
        }
      }
    } catch (error) {
      console.error('Hiba:', error);
    }
  }

  function updateRatingInfo(averageRating, totalRatings) {
    const modalElement = document.querySelector('.modal.show');
    if (modalElement) {
      const averageRatingSpan = modalElement.querySelector('.average-rating');
      const ratingCountSpan = modalElement.querySelector('.rating-count');
      
      if (averageRatingSpan && ratingCountSpan) {
        averageRatingSpan.textContent = averageRating;
        ratingCountSpan.textContent = totalRatings;
      }
    }
  }

  async function loadComments(filmId) {
    try {
      const response = await fetch(`${apiUrl}/comments/${filmId}`);
      const comments = await response.json();
      
      const commentsList = document.querySelector(`#filmModal${filmId} .comments-list`);
      commentsList.innerHTML = comments.map(comment => `
        <div class="comment mb-3 p-3 bg-dark rounded">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <strong>${comment.User.name}</strong>
            ${currentUser && (currentUser.id === comment.userId || currentUser.role === 'admin') ? `
              <button class="btn btn-sm btn-danger delete-comment" data-comment-id="${comment.id}">
                <i class="bi bi-trash"></i>
              </button>
            ` : ''}
          </div>
          <p class="mb-0">${comment.content}</p>
          <small class="text-muted">${new Date(comment.createdAt).toLocaleString()}</small>
        </div>
      `).join('');

      // Komment törlés kezelése
      commentsList.querySelectorAll('.delete-comment').forEach(btn => {
        btn.addEventListener('click', async () => {
          const commentId = btn.dataset.commentId;
          if (confirm('Biztosan törölni szeretnéd ezt a kommentet?')) {
            try {
              const response = await fetch(`${apiUrl}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (response.ok) {
                btn.closest('.comment').remove();
              }
            } catch (error) {
              console.error('Hiba:', error);
            }
          }
        });
      });
    } catch (error) {
      console.error('Hiba:', error);
    }
  }

  function addCommentToList(comment) {
    const commentsList = document.querySelector(`#filmModal${comment.filmId} .comments-list`);
    const commentHtml = `
      <div class="comment mb-3 p-3 bg-dark rounded">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong>${comment.User.name}</strong>
          <button class="btn btn-sm btn-danger delete-comment" data-comment-id="${comment.id}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <p class="mb-0">${comment.content}</p>
        <small class="text-muted">${new Date(comment.createdAt).toLocaleString()}</small>
      </div>
    `;
    commentsList.insertAdjacentHTML('afterbegin', commentHtml);
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

  async function loadAdminDashboard() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nincs bejelentkezve!');
      }

      console.log('Token:', token);

      const [usersResponse, filmsResponse, statsResponse] = await Promise.all([
        fetch(`${apiUrl}/admin/users`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${apiUrl}/admin/films`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${apiUrl}/admin/stats`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!usersResponse.ok) {
        const errorData = await usersResponse.json();
        throw new Error(`Felhasználók betöltése sikertelen: ${errorData.error || usersResponse.statusText}`);
      }
      if (!filmsResponse.ok) {
        const errorData = await filmsResponse.json();
        throw new Error(`Filmek betöltése sikertelen: ${errorData.error || filmsResponse.statusText}`);
      }
      if (!statsResponse.ok) {
        const errorData = await statsResponse.json();
        throw new Error(`Statisztikák betöltése sikertelen: ${errorData.error || statsResponse.statusText}`);
      }

      const [users, films, stats] = await Promise.all([
        usersResponse.json(),
        filmsResponse.json(),
        statsResponse.json()
      ]);

      console.log('Loaded data:', { users, films, stats });
      renderAdminDashboard(users, films, stats);
    } catch (error) {
      console.error('Admin dashboard betöltési hiba:', error);
      const dashboardContent = document.getElementById('adminDashboardContent');
      dashboardContent.innerHTML = `
        <div class="alert alert-danger">
          <h4>Hiba történt az admin felület betöltésekor</h4>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  function renderAdminDashboard(users, films, stats) {
    const dashboardContent = document.getElementById('adminDashboardContent');
    dashboardContent.innerHTML = `
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card bg-dark text-white">
            <div class="card-body">
              <h5 class="card-title">Felhasználók száma</h5>
              <p class="card-text display-4">${stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-dark text-white">
            <div class="card-body">
              <h5 class="card-title">Filmek száma</h5>
              <p class="card-text display-4">${stats.totalFilms}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-dark text-white">
            <div class="card-body">
              <h5 class="card-title">Kategóriák száma</h5>
              <p class="card-text display-4">${stats.totalCategories}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="card bg-dark text-white mb-4">
            <div class="card-header">
              <h5 class="mb-0">Felhasználók kezelése</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-dark">
                  <thead>
                    <tr>
                      <th>Név</th>
                      <th>Email</th>
                      <th>Jogosultság</th>
                      <th>Műveletek</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${users.map(user => `
                      <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>
                          <select class="form-select form-select-sm" onchange="updateUserRole(${user.id}, this.value)">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>Felhasználó</option>
                            <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Moderátor</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                          </select>
                        </td>
                        <td>
                          <button class="btn btn-sm btn-danger" onclick="toggleUserStatus(${user.id})">
                            ${user.isActive ? 'Tiltás' : 'Aktiválás'}
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-dark text-white mb-4">
            <div class="card-header">
              <h5 class="mb-0">Filmek értékelései</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-dark">
                  <thead>
                    <tr>
                      <th>Film</th>
                      <th>Átlagos értékelés</th>
                      <th>Értékelések száma</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${stats.filmsWithRatings.map(film => `
                      <tr>
                        <td>${film.title}</td>
                        <td>
                          <div class="d-flex align-items-center">
                            <span class="me-2">${film.averageRating}</span>
                            <div class="rating-stars small">
                              ${[1, 2, 3, 4, 5].map(star => `
                                <i class="bi bi-star-fill ${star <= Math.round(film.averageRating) ? 'text-warning' : 'text-secondary'}"></i>
                              `).join('')}
                            </div>
                          </div>
                        </td>
                        <td>${film.ratingCount}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="card bg-dark text-white mb-4">
            <div class="card-header">
              <h5 class="mb-0">Kategóriák kezelése</h5>
            </div>
            <div class="card-body">
              <form id="categoryForm" class="mb-3">
                <div class="input-group">
                  <input type="text" id="newCategory" class="form-control" placeholder="Új kategória neve" required>
                  <button type="submit" class="btn btn-primary">Hozzáadás</button>
                </div>
              </form>
              <div class="table-responsive">
                <table class="table table-dark">
                  <thead>
                    <tr>
                      <th>Kategória</th>
                      <th>Műveletek</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${stats.categories.map(category => `
                      <tr>
                        <td>${category.name}</td>
                        <td>
                          <button class="btn btn-sm btn-danger" onclick="deleteCategory('${category.id}')">
                            <i class="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listener hozzáadása a kategória formhoz
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
      categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoryName = document.getElementById('newCategory').value;

        try {
          const response = await fetch(`${apiUrl}/admin/categories`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: categoryName })
          });

          if (!response.ok) throw new Error('Hiba a kategória hozzáadásakor');
          document.getElementById('newCategory').value = '';
          loadAdminDashboard();
        } catch (error) {
          alert('Hiba történt a kategória hozzáadásakor');
        }
      });
    }

    // Globális függvények definiálása
    window.updateUserRole = async (userId, newRole) => {
      try {
        const response = await fetch(`${apiUrl}/admin/users/${userId}/role`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: newRole })
        });

        if (!response.ok) throw new Error('Hiba a jogosultság módosításakor');
        loadAdminDashboard();
      } catch (error) {
        alert(error.message);
      }
    };

    window.toggleUserStatus = async (userId) => {
      try {
        const response = await fetch(`${apiUrl}/admin/users/${userId}/toggle`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Hiba a felhasználó állapotának módosításakor');
        loadAdminDashboard();
      } catch (error) {
        alert('Hiba történt a felhasználó állapotának módosításakor');
      }
    };

    window.deleteCategory = async (categoryId) => {
      if (!confirm('Biztosan törölni szeretnéd ezt a kategóriát?')) return;

      try {
        const response = await fetch(`${apiUrl}/admin/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Hiba a kategória törlésekor');
        loadAdminDashboard();
      } catch (error) {
        alert('Hiba történt a kategória törlésekor');
      }
    };
  }

  const favoritesSearchInput = document.getElementById('favoritesSearchInput');
  const favoritesCategoryFilter = document.getElementById('favoritesCategoryFilter');

  favoritesSearchInput.addEventListener('input', filterFavoriteFilms);
  favoritesCategoryFilter.addEventListener('change', filterFavoriteFilms);

  // Kedvencek betöltése
  async function loadFavorites() {
    if (!currentUser) return;

    try {
      const response = await fetch(`${apiUrl}/favorites`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const favorites = await response.json();
      favoriteFilms = favorites.map(fav => fav.Film);
      filterFavoriteFilms();
    } catch (error) {
      console.error('Hiba a kedvencek betöltésekor:', error);
    }
  }

  // Kedvencek szűrése
  function filterFavoriteFilms() {
    const searchTerm = favoritesSearchInput.value.toLowerCase();
    const selectedCategory = favoritesCategoryFilter.value;

    filteredFavoriteFilms = favoriteFilms.filter(film => {
      const matchesSearch = film.title.toLowerCase().includes(searchTerm) ||
                          film.description.toLowerCase().includes(searchTerm);
      const matchesCategory = !selectedCategory || film.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    renderFavoriteFilms(filteredFavoriteFilms);
  }

  // Kedvencek megjelenítése
  function renderFavoriteFilms(films) {
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = "";

    if (films.length === 0) {
      favoritesList.innerHTML = '<div class="col-12"><p class="text-center text-white">Nincs találat a keresési feltételeknek megfelelően.</p></div>';
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
      favoritesList.appendChild(col);
    });
  }

  // Kedvencekhez adás/eltávolítás kezelése
  async function toggleFavorite(filmId) {
    if (!currentUser) {
      alert('Jelentkezz be a kedvencekhez adáshoz!');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/favorites/${filmId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        if (data.action === 'added') {
          const film = allFilms.find(f => f.id === filmId);
          if (film) {
            favoriteFilms.push(film);
            filterFavoriteFilms();
          }
        } else {
          favoriteFilms = favoriteFilms.filter(f => f.id !== filmId);
          filterFavoriteFilms();
        }
      }
    } catch (error) {
      console.error('Hiba a kedvencek kezelésekor:', error);
    }
  }

  loadFilms();
});
