import '../css/styles.css';
import { get } from 'lodash';

const elements = {
  backBtn: '.back-btn',
  searchContainer: '.search-container',
  input: '#input-search',
  searchButton: '#button-search',
  errorMessage: '.error-message',
  loader: '.loader',
  booksPageTitle: '.books-page-title',
  resultContainer: '.result-container',
  descriptionWindow: '.description-window',
};
for (let name in elements) {
  elements[name] = document.querySelector(elements[name]);
}
const {
  backBtn,
  searchContainer,
  input,
  searchButton,
  errorMessage,
  loader,
  booksPageTitle,
  resultContainer,
  descriptionWindow,
} = elements;

// TODO vedere le Environment Variables

// fetch books and print them passing category as parameter
const handleSearch = async (category) => {
  loader.style.display = 'block'

  const data = await fetch(`https://openlibrary.org/subjects/${category}.json`);
  const dataJson = await data.json()
  const books = get(dataJson, 'works', 'invoca') // get books

  if (category === '' || dataJson.work_count === 0) {

    loader.style.display = 'none'

    errorMessage.innerText = 'Category not found';
    setTimeout(() => {
      errorMessage.innerText = 'ㅤ'
    }, 2000);
    return
  }

  backBtn.style.display = 'block'
  searchContainer.style.display = 'none'
  displayBooks(books, category)
}

// loop all title and print them
const displayBooks = ((books, category) => {
  resultContainer.innerHTML = '';
  booksPageTitle.innerText = `BOOKS FOR "${category.toUpperCase()}" CATEGORY:`

  for (const book of books) {
    // get key
    const key = get(book, 'key', 'Key not found')
    const item = document.createElement('div');

    // get authors
    let authors = get(book, 'authors', 'Author not found')
    if (Array.isArray(authors)) {
      if (authors.length <= 4) {
        authors = authors
          .map((author) => {
            return author.name;
          })
          .join(', ');
      } else {
        authors = `${authors[0].name}, ${authors[1].name}, ${authors[2].name}, ${authors[3].name} and others`;
      }
    }

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
  }
)

// event to invoke search function and to check whether the user types space
input.onkeydown = e => {
  if (e.key === 'Enter') {
    handleSearch(input.value.trim()).then()
  }
  if (e.which === 32) {
    errorMessage.innerText = 'categories with multiple names not available'

    setTimeout(() => {
      errorMessage.innerText = 'ㅤ'
    }, 2000);
    return false;
  }
}

// back to search page
backBtn.addEventListener('click', () => {
  searchContainer.style.display = 'flex'
  backBtn.style.display = 'none'
  resultContainer.innerHTML = ''
  booksPageTitle.innerText = ''
  loader.style.display = 'none'
})
