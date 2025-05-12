import { initFilmForm } from './filmForm.js'
import { renderFilmList } from './filmList.js'
import { initCategoryFilter } from './categoryFilter.js'

const films = [
  {
    title: 'A sötét lovag',
    description: 'Batman szembeszáll Jokerrel Gotham városának megmentéséért.',
    time: '152',
    category: 'Akció'
  },
  {
    title: 'Eredet',
    description: 'Egy csapat tudatbefúró elmébe hatol, hogy ellopjon egy ötletet.',
    time: '148',
    category: 'Sci-fi'
  },
  {
    title: 'Forrest Gump',
    description: 'Egy egyszerű férfi különleges életútja az amerikai történelem során.',
    time: '142',
    category: 'Dráma'
  },
  {
    title: 'Másnaposok',
    description: 'Egy legénybúcsú Las Vegasban nagyon félremegy.',
    time: '100',
    category: 'Vígjáték'
  },
  {
    title: 'Az ördögűző',
    description: 'Egy kislány megszállását próbálják megakadályozni egy ördögűzővel.',
    time: '122',
    category: 'Horror'
  }
]

const categories = ['Romantikus', 'Akció', 'Vígjáték', 'Dráma', 'Sci-fi', 'Horror']

let searchTerm = ''
let selectedCategory = ''

document.addEventListener('DOMContentLoaded', () => {
  refreshFilmList()

  document.getElementById('search').addEventListener('input', e => {
    searchTerm = e.target.value
    refreshFilmList()
  })

  initFilmForm(film => {
    films.push(film)
    refreshFilmList()
  }, categories)

  initCategoryFilter(categories, selected => {
    selectedCategory = selected
    refreshFilmList()
  })
})

function refreshFilmList() {
  const filtered = films.filter(film =>
    (film.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     film.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === '' || film.category === selectedCategory)
  )

  renderFilmList(filtered)
}
