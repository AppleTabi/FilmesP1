export function initFilmForm(onAddFilm, categories) {
    const container = document.getElementById('film-form')
    container.innerHTML = `
      <form id="upload-form">
        <input type="text" id="title" placeholder="Film címe" required />
        <textarea id="description" placeholder="Leírás" required></textarea>
        <select id="category" required>
          <option value="">Válassz kategóriát</option>
          ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        </select>
        <button type="submit">Feltöltés</button>
      </form>
    `
  
    const form = document.getElementById('upload-form')
    form.addEventListener('submit', e => {
      e.preventDefault()
      const film = {
        title: form.title.value,
        description: form.description.value,
        category: form.category.value
      }
      onAddFilm(film)
      form.reset()
    })
  }
  