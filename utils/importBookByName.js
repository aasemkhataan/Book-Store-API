const axios = require("axios");

function scoreBookData(info) {
  let score = 0;
  if (info.title) score++;
  if (info.authors) score++;
  if (info.description) score += 2;
  if (info.pageCount) score++;
  if (info.categories) score++;
  if (info.imageLinks?.thumbnail) score++;
  if (info.publisher) score++;
  if (info.publishedDate) score++;
  if (info.industryIdentifiers) score++;
  return score;
}

async function getTopScoredBook(title, author) {
  const query = `intitle:${title} inauthor:${author}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${title} inauthor:${author}&key=AIzaSyAW1_3VsB5f5jtTglakcyX5p5Btz5KvwxA`;

  const res = await axios.get(url);
  const books = res.data.items || [];

  books.forEach((book) => {
    book.score = scoreBookData(book.volumeInfo);
  });

  const topBook = books.sort((a, b) => b.score - a.score)[0];

  const bookData = topBook?.volumeInfo;
  console.log("Book Data", bookData);
  const book = {
    title: bookData?.title,
    author: bookData.authors,
    pageCount: bookData.pageCount,
    publisher: bookData.publisher,
    publishedDate: bookData.publishedDate,
    description: bookData.description,
    imageLinks: bookData.imageLinks?.thumbnail,
    language: bookData.language || "ar",
    categories: bookData.categories?.[0].toLowerCase(),
    ISBN_10: bookData.industryIdentifiers?.find((id) => id.type === "ISBN_10")?.identifier,
    ISBN_13: bookData.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier,
  };
  return book;
}
module.exports = getTopScoredBook;
