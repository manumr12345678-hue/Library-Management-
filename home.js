// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ------------------ Firebase Helpers ------------------
// Write data to Firebase
export async function writeData(path, data) {
  await set(ref(db, path), data);
  console.log("Data written:", data);
}

// Read user by college name
export async function readUser(collegeName) {
  try {
    const snapshot = await get(ref(db, `users/${collegeName}`));
    if (!snapshot.exists()) return null;
    return snapshot.val(); // returns { password: "..." }
  } catch (err) {
    console.error("Error reading user:", err);
    return null;
  }
}

// ------------------ Login / Registration ------------------
export async function registerUser() {
  const usernameInput = document.getElementById("collegeName");
  const passwordInput = document.getElementById("password");

  if (!usernameInput || !passwordInput) return;

  const collegeName = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!collegeName || !password) {
    alert("College name and password are required.");
    return;
  }

  const existingUser = await readUser(collegeName);
  if (existingUser) {
    alert("College already registered. Choose another.");
    return;
  }

  // Save user under college name key
  await writeData(`users/${collegeName}`, { password });
  alert("Registration successful!");
  localStorage.setItem("collegeName", collegeName);
  window.location.href = "home.html";
}

export async function loginUser() {
  const usernameInput = document.getElementById("collegeName");
  const passwordInput = document.getElementById("password");

  if (!usernameInput || !passwordInput) return;

  const collegeName = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!collegeName || !password) {
    alert("Enter both fields properly.");
    return;
  }

  const user = await readUser(collegeName);
  if (!user) {
    alert("User not found. Please register.");
    return;
  }

  if (user.password === password) {
    alert("Login successful!");
    localStorage.setItem("collegeName", collegeName);
    window.location.href = "home.html";
  } else {
    alert("Incorrect password.");
  }
}


// ------------------ Home Page Functions ------------------
export function displayCollegeName() {
  const span = document.getElementById("collegeNameDisplay");
  const disname = localStorage.getItem("collegeName");
  if (span && disname) span.textContent = disname;
}

function showAddEntryForm() {
  const overlay = document.getElementById("addEntryFormOverlay");
  if (overlay) overlay.style.display = "flex";
}

function hideAddEntryForm() {
  const overlay = document.getElementById("addEntryFormOverlay");
  if (overlay) overlay.style.display = "none";
}

// Handle "Add Entry" Form Submission
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addEntryBtn");
  const cancelBtn = document.getElementById("cancelAddEntryBtn");
  const form = document.getElementById("issueBookForm");

  if (addBtn) addBtn.addEventListener("click", showAddEntryForm);
  if (cancelBtn) cancelBtn.addEventListener("click", hideAddEntryForm);

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const bookData = {
        bookName: document.getElementById("bookName").value,
        studentName: document.getElementById("studentName").value,
        course: document.getElementById("course").value,
        section: document.getElementById("section").value,
        floor: document.getElementById("floor").value,
        block: document.getElementById("block").value,
        returnDate: document.getElementById("returnDate").value
      };

      const issueDate = document.getElementById("issueDate").value; // use date as key
      const collegeName = localStorage.getItem("collegeName");

      if (collegeName && issueDate) {
        const path = `users/${collegeName}/issuedBooks/${issueDate}`;
        await writeData(path, bookData);
        alert("Book issued successfully!");
      }

      form.reset();
      hideAddEntryForm();
    });
  }

  // Display college name if on home page
  displayCollegeName();
});


// Expose functions to HTML
window.registerUser = registerUser;
window.loginUser = loginUser;
window.displayCollegeName = displayCollegeName;
window.showAddEntryForm = showAddEntryForm;
window.hideAddEntryForm = hideAddEntryForm;
