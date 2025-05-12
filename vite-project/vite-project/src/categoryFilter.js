export function initCategoryFilter(categories, onSelect) {
    const container = document.getElementById('category-filter')
    container.innerHTML = `
      <select id="category-select">
        <option value="">Összes kategória</option>
        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
      </select>
    `
    document.getElementById('category-select').addEventListener('change', e => {
      onSelect(e.target.value)
    })
  }
  