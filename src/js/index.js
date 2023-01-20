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

/* these two environment variables basically have no practical meaning in this project,
but were implemented to practise with them.*/
const apiUrl = process.env.API
const apiUrlCovers = process.env.API_COVERS

// fetch books and print them passing category as parameter
const handleSearch = async (category) => {
  loader.style.display = 'block'

  const data = await fetch(`${apiUrl}/subjects/${category}.json`);
  const dataJson = await data.json()
  const books = get(dataJson, 'works', 'invoca') // get books

  // api call check
  if (data.status === 404 || dataJson.work_count === 0) {

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

    const item = document.createElement('div');
    item.classList.add('book-card')
    item.innerHTML =
      `
        <img src="${apiUrlCovers}${book.cover_id}-L.jpg" alt="cover" width="180px" height="270px">
        <p>${book.title}</p> <br>
        <p style="font-size: 1.4rem; margin-top: -1.5rem; font-style: italic;">Author: ${authors}</p>
    `
    item.addEventListener('click', () => {
      const key = get(book, 'key', 'Key not found')
      displayBookDetails(key).then();
    });
    resultContainer.appendChild(item);
  }

})

// fetch description and print it
const displayBookDetails = async (key) => {
  const data = await fetch(`${apiUrl}${key}.json`)
  const dataJson = await data.json()
  console.log(dataJson)
  const description = get(dataJson, 'description', 'No description for this book')

  // description check
  const descriptionText = !description || !description.value
    ? 'No description for this book'
    : description.value;

  descriptionWindow.innerHTML =
    `
    <button class="close-btn">X</button>
    <h1>Description:</h1>
    <p>${descriptionText}
    </p>
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
    handleSearch(input.value.trim().toLowerCase()).then();
  }
)

// event to invoke search function and to check whether the user types space
input.onkeydown = e => {
  if (e.key === 'Enter') {
    handleSearch(input.value.trim().toLowerCase()).then()
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
