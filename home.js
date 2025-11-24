import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAayFLRlj8nH5DlExgtuYahM2__c17BMHI",
  authDomain: "librarymanagement-73390.firebaseapp.com",
  databaseURL: "https://librarymanagement-73390-default-rtdb.firebaseio.com",
  projectId: "librarymanagement-73390",
  storageBucket: "librarymanagement-73390.firebasestorage.app",
  messagingSenderId: "229998806686",
  appId: "1:229998806686:web:09bc196f9ddaee63e8dd8f",
  measurementId: "G-ELGJN46Z9V"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Helpers
async function writeData(path, data) { await set(ref(db, path), data); }
async function readData(path) { 
  const snapshot = await get(ref(db, path)); 
  return snapshot.exists() ? snapshot.val() : null; 
}

// Display college name
export function displayCollegeName() {
  const span = document.getElementById("collegeNameDisplay");
  const collegeName = localStorage.getItem("collegeName");
  if (span && collegeName) span.textContent = collegeName;
}

// Show/Hide Form
let currentEditId = null; // track editing

function showAddEntryForm() {
  document.getElementById("addEntryFormOverlay").style.display = "flex";
  if (!currentEditId) document.getElementById("issueBookForm").reset();
}

function hideAddEntryForm() { 
  document.getElementById("addEntryFormOverlay").style.display = "none"; 
  currentEditId = null;
}

// Handle Issue / Edit Book
async function handleIssueBook(e) {
  e.preventDefault();
  const collegeName = localStorage.getItem("collegeName");
  if (!collegeName) return;

  const bookId = currentEditId || Date.now();
  currentEditId = null;

  const today = new Date();

  const returnDaysInput = parseInt(document.getElementById("returnDays").value);
  if (isNaN(returnDaysInput) || returnDaysInput < 1) { alert("Enter valid return days"); return; }

  const returnDate = new Date(today);
  returnDate.setDate(today.getDate() + returnDaysInput);
  const returnDateStr = returnDate.toISOString().split("T")[0];

  const bookData = {
    bookName: document.getElementById("bookName").value,
    studentName: document.getElementById("studentName").value,
    collegeId: document.getElementById("collegeId").value,
    course: document.getElementById("course").value,
    section: document.getElementById("section").value,
    floor: document.getElementById("floor").value,
    block: document.getElementById("block").value,
    issueDate: today.toISOString().split("T")[0],
    returnDate: returnDateStr
  };

  await writeData(`users/${collegeName}/issuedBooks/${bookId}`, bookData);
  alert(`Book saved successfully! Return by: ${returnDateStr}`);

  e.target.reset();
  hideAddEntryForm();
  displayIssuedBooks();
}

// Edit Book
function editBook(bookId, book) {
  currentEditId = bookId;
  showAddEntryForm();

  document.getElementById("bookName").value = book.bookName;
  document.getElementById("studentName").value = book.studentName;
  document.getElementById("collegeId").value = book.collegeId || "";
  document.getElementById("course").value = book.course;
  document.getElementById("section").value = book.section;
  document.getElementById("floor").value = book.floor;
  document.getElementById("block").value = book.block;
  document.getElementById("returnDays").value = "";
}

// Display Issued Books
// Display Issued Books with Edit and Return buttons
export async function displayIssuedBooks() {
  const collegeName = localStorage.getItem("collegeName");
  if (!collegeName) return;

  const books = await readData(`users/${collegeName}/issuedBooks`) || {};
  const list = document.getElementById("issuedBooksList");
  list.innerHTML = "";

  for (const bookId in books) {
    const book = books[bookId];

    const li = document.createElement("li");
    li.classList.add("book-card");

    li.innerHTML = `
      <div><strong>Name:</strong> ${book.studentName}</div>
      <div><strong>College ID:</strong> ${book.collegeId || ""}</div>
      <div><strong>Book:</strong> ${book.bookName}</div>
      <div><strong>Course:</strong> ${book.course}</div>
      <div><strong>Section:</strong> ${book.section}</div>
      <div><strong>Floor:</strong> ${book.floor}</div>
      <div><strong>Block:</strong> ${book.block}</div>
      <div><strong>Issued:</strong> ${book.issueDate}</div>
      <div><strong>Return by:</strong> ${book.returnDate}</div>
    `;

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.style.marginRight = "10px";
    editBtn.addEventListener("click", () => editBook(bookId, book));
    li.appendChild(editBtn);

    // Return button
    const returnBtn = document.createElement("button");
    returnBtn.textContent = "Return";
    returnBtn.addEventListener("click", () => returnBook(bookId, book));
    li.appendChild(returnBtn);

    list.appendChild(li);
  }
}


// Return Book
async function returnBook(bookId, book) {
  const collegeName = localStorage.getItem("collegeName");
  if (!collegeName) return;

  await writeData(`users/${collegeName}/issuedBooks/${bookId}`, null);

  const returnedBook = { ...book, actualReturnDate: new Date().toISOString().split("T")[0] };
  await writeData(`users/${collegeName}/returnedBooks/${bookId}`, returnedBook);

  displayIssuedBooks();
  displayReturnedBooks();
}

// Display Returned Books
export async function displayReturnedBooks() {
  const collegeName = localStorage.getItem("collegeName");
  if (!collegeName) return;

  const books = await readData(`users/${collegeName}/returnedBooks`) || {};
  const list = document.getElementById("returnedBooksList");
  list.innerHTML = "";

  for (const bookId in books) {
    const book = books[bookId];

    const li = document.createElement("li");
    li.classList.add("book-card"); // add class for styling

    li.innerHTML = `
      <div><strong>Name:</strong> ${book.studentName}</div>
      <div><strong>College ID:</strong> ${book.collegeId || ""}</div>
      <div><strong>Book:</strong> ${book.bookName}</div>
      <div><strong>Course:</strong> ${book.course}</div>
      <div><strong>Section:</strong> ${book.section}</div>
      <div><strong>Floor:</strong> ${book.floor}</div>
      <div><strong>Block:</strong> ${book.block}</div>
      <div><strong>Issued:</strong> ${book.issueDate}</div>
      <div><strong>Returned:</strong> ${book.actualReturnDate}</div>
    `;

    list.appendChild(li);
  }
}

// DOM listeners
document.addEventListener("DOMContentLoaded", () => {
  displayCollegeName();
  displayIssuedBooks();
  displayReturnedBooks();

  document.getElementById("addEntryBtn").addEventListener("click", showAddEntryForm);
  document.getElementById("cancelAddEntryBtn").addEventListener("click", hideAddEntryForm);
  document.getElementById("issueBookForm").addEventListener("submit", handleIssueBook);

  // About modal
  const aboutBtn = document.getElementById("aboutBtn");
  const aboutModal = document.getElementById("aboutModal");
  const closeAboutBtn = document.getElementById("closeAboutBtn");

  aboutBtn.addEventListener("click", () => {
    aboutModal.style.display = "flex";
  });

  closeAboutBtn.addEventListener("click", () => {
    aboutModal.style.display = "none";
  });
});

// Expose globally
window.showAddEntryForm = showAddEntryForm;
window.hideAddEntryForm = hideAddEntryForm;
window.displayIssuedBooks = displayIssuedBooks;
window.displayReturnedBooks = displayReturnedBooks;
