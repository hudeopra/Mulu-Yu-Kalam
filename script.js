import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDn0sppQ-6k3aXwKze7CIdHYIUt0WmuiDo",
  authDomain: "mulu-yu-kalam-76d03.firebaseapp.com",
  projectId: "mulu-yu-kalam-76d03",
  storageBucket: "mulu-yu-kalam-76d03.appspot.com",
  messagingSenderId: "287033036710",
  appId: "1:287033036710:web:da4f91a47ef8c3950fc967",
  measurementId: "G-1PQDPMD63G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ratingsList = document.querySelector("#ratingsList");

const renderRatings = (snapshot) => {
  ratingsList.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const timestamp = data.timestamp;
    const name = data.name;
    const email = data.email;
    const number = data.number;
    const tattooLocation = data["tattoo-location"];
    const appointmentDate = data["appointment-date"];
    const appointmentTime = data["appointment-time"];

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${timestamp}</td>
        <td>${name}</td>
        <td>${email}</td>
        <td>${number}</td>
        <td>${tattooLocation}</td>
        <td>${appointmentDate}</td>
        <td>${appointmentTime}</td>
    `;
    ratingsList.appendChild(row);
  });
};

let sortBy = "timestamp";
let sortDirection = "asc";

const sortTable = (field) => {
  let direction = sortDirection === "asc" ? "desc" : "asc";
  const sortedSnapshot = query(
    collection(db, "tattoo-appointments"),
    orderBy(field, direction)
  );
  onSnapshot(sortedSnapshot, renderRatings);
  sortBy = field;
  sortDirection = direction;
};

document.querySelectorAll(".btn-sort").forEach((btn) => {
  btn.addEventListener("click", function () {
    const sortField = this.dataset.sort;
    sortTable(sortField);
  });
});

// Initial load sorted by timestamp ascending
sortTable("timestamp");
