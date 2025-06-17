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
  const query = author ? `intitle:${title}+inauthor:${author}` : `intitle:${title}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
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
    coverImage: bookData.imageLinks?.thumbnail,
    language: bookData.language || "ar",
    categories: bookData.categories?.[0].toLowerCase(),
    ISBN_10: bookData.industryIdentifiers?.find((id) => id.type === "ISBN_10")?.identifier,
    ISBN_13: bookData.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier,
  };
  return book;
}
module.exports = getTopScoredBook;

// const axios = require("axios");

// async function getAllBooksData(title, author) {
//   const query = author ? `intitle:${title}+inauthor:${author}` : `intitle:${title}`;
//   const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyAW1_3VsB5f5jtTglakcyX5p5Btz5KvwxA`;

//   const res = await axios.get(url);
//   const books = res.data.items || [];

//   const result = {
//     titles: [],
//     authors: [],
//     descriptions: [],
//     pageCounts: [],
//     publishers: [],
//     publishedDates: [],
//     imageLinks: [],
//     languages: [],
//     categories: [],
//     ISBN_10: [],
//     ISBN_13: [],
//   };
//   books.forEach(({ volumeInfo }) => {
//     if (volumeInfo.title) result.titles.push(volumeInfo.title);
//     if (volumeInfo.authors) result.authors.push(...volumeInfo.authors);
//     if (volumeInfo.description) result.descriptions.push(volumeInfo.description);
//     if (volumeInfo.pageCount) result.pageCounts.push(volumeInfo.pageCount);
//     if (volumeInfo.publisher) result.publishers.push(volumeInfo.publisher);
//     if (volumeInfo.publishedDate) result.publishedDates.push(volumeInfo.publishedDate);
//     if (volumeInfo.imageLinks?.thumbnail) result.imageLinks.push(volumeInfo.imageLinks.thumbnail);
//     if (volumeInfo.language) result.languages.push(volumeInfo.language);
//     if (volumeInfo.categories) result.categories.push(...volumeInfo.categories.map((cat) => cat.toLowerCase()));

//     const ISBN_10 = volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_10")?.identifier;
//     const ISBN_13 = volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier;

//     if (ISBN_10) result.ISBN_10.push(ISBN_10);
//     if (ISBN_13) result.ISBN_13.push(ISBN_13);
//   });

//   console.log(result);
//   return result;
// }

// module.exports = getAllBooksData;
