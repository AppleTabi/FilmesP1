export function renderFilmList(films) {
    const container = document.getElementById('film-list')
    container.innerHTML = ''
  
    if (films.length === 0) {
      container.innerHTML = '<p>Nincs találat.</p>'
      return
    }
  
    films.forEach(film => {
      const card = document.createElement('div')
      card.className = 'film-card'
      card.innerHTML = `
        <h3>${film.title}</h3>
        <p>${film.description}</p>
        <small>Hossza: ${film.time} perc</small><br>
        <small>Kategória: ${film.category}</small>
        <p></p>
      `
      container.appendChild(card)
    })
  }
  