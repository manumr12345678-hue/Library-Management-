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
async function readUser(collegeName) {
  try {
    const snapshot = await get(ref(db, `users/${collegeName}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function writeData(path, data) {
  await set(ref(db, path), data);
}

// Register User
export async function registerUser() {
  const collegeName = document.getElementById("collegeName").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!collegeName || !password) {
    alert("Enter both fields");
    return;
  }

  const existingUser = await readUser(collegeName);
  if (existingUser) {
    alert("College already exists");
    return;
  }

  await writeData(`users/${collegeName}`, { password });
  localStorage.setItem("collegeName", collegeName);
  alert("Registration successful!");
  window.location.href = "home.html";
}

// Login User
export async function loginUser() {
  const collegeName = document.getElementById("collegeName").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!collegeName || !password) {
    alert("Enter both fields");
    return;
  }

  const user = await readUser(collegeName);
  if (!user) {
    alert("College not found");
    return;
  }

  if (user.password !== password) {
    alert("Incorrect password");
    return;
  }

  localStorage.setItem("collegeName", collegeName);
  alert("Login successful!");
  window.location.href = "home.html";
}

// Password toggle
window.togglePassword = function () {
  const input = document.getElementById("password");
  input.type = input.type === "password" ? "text" : "password";
};

// Attach buttons if they exist
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");

  if (loginBtn) loginBtn.addEventListener("click", loginUser);
  if (registerBtn) registerBtn.addEventListener("click", registerUser);
});
