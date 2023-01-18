import '../css/styles.css';
import { get } from 'lodash';

const elements = {
  input: '#input-search',
  searchButton: '#button-search',
  resultContainer: '#result-container',
  descriptionWindow: '#description-window',
  booksPageTitle: '#books-page-title',
  searchContainer: '#search-container',
  navBar: '#navbar',
  navTitle: '#nav-title',
  backBtn: '#back-btn',
};
for (let name in elements) {
  elements[name] = document.querySelector(elements[name]);
}
const { input, searchButton, resultContainer, backBtn, descriptionWindow, booksPageTitle, searchContainer } = elements;
const [loader] = document.body.getElementsByClassName('loader');


// TODO correggere verifica di ricerca
// TODO vedere le Environment Variables
// TODO rendere responsive la descrizione dei libri
// TODO rendere responsive la descrizione dei libri


let errorDisplayed = false
// fetch books and print them passing category as parameter
const handleSearch = async (category, sortBy) => {
  const data = await fetch(`https://openlibrary.org/subjects/${category}.json`);
  const dataJson = await data.json()
  const books = get(dataJson, 'works')

  if (category === '' ) {
    if (errorDisplayed) return
    errorDisplayed = true
    const item = document.createElement('div')
    item.className = 'error-message'
    item.textContent = 'Category not found'

    searchContainer.appendChild(item)
    setTimeout(() => {
      item.style.display = 'none';
      errorDisplayed = false
    }, 3000);
    return
  }

  backBtn.style.display = 'block'
  searchContainer.style.display = 'none'
  displayBooks(books, category)
}

// map all title and print them
const displayBooks = ((books, category) => {
  if (books.length === 0) return

  resultContainer.innerHTML = '';
  booksPageTitle.innerText = `BOOKS FOR "${category.toUpperCase()}" CATEGORY:`

  for (const book of books) {
    const key = get(book, 'key', 'Key not found')
    const item = document.createElement('div');

    let authors = get(book, 'authors', 'Author not found')
    if (Array.isArray(authors)) {
      if (authors.length <= 4) {
        authors = authors
          .map((author) => {
            return author.name;
          })
          .join(", ");
      } else {
        authors = `${authors[0].name}, ${authors[1].name}, ${authors[2].name}, ${authors[3].name} and others`;
      }
    };


    item.classList.add('book-card')

    item.innerHTML =
      `
        <img src="https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg" alt="cover" width="180px" height="270px">
        <p>${book.title}</p> <br>
        <p style="font-size: 1.4rem; margin-top: -1.5rem; font-style: italic;">Author: ${authors}</p>
    `
    item.addEventListener('click', function () {
      displayBookDetails(key).then();
    });
    resultContainer.appendChild(item);
  }

})

// fetch description and print it
const displayBookDetails = async (key) => {
  const data = await fetch(`https://openlibrary.org${key}.json`)
  const dataJson = await data.json()
  const description = dataJson.description;


  descriptionWindow.innerHTML =
    `
    <button class="close-btn">X</button>
    <h1>Description:</h1>
    <p>${(description === undefined || typeof (description) === 'object') ? 'No description for this book' : description}</p>
  `

  descriptionWindow.style.display = 'block'

  closeBtn()
}

// close description window
const closeBtn = () => {
  const [closeBtn] = document.getElementsByClassName('close-btn')
  closeBtn.addEventListener('click', () => {
    descriptionWindow.style.display = 'none'
  })
}

// event listener for search books
searchButton.addEventListener('click', () => {
    handleSearch(input.value).then();
    loader.style.display = 'block'
  }
)

// event for search books with enter key
input.onkeydown = e => {
  if (e.key === 'Enter') {
    handleSearch(input.value).then(),
      loader.style.display = 'block'
  }
}

// back to search page
backBtn.addEventListener('click', () => {
  searchContainer.style.display = 'block'
  backBtn.style.display = 'none'
  resultContainer.innerHTML = ''
  booksPageTitle.innerText = ''
  loader.style.display = 'none'
})
