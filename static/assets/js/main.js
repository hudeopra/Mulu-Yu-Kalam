document.querySelector('.ph-btn').onclick = function(event) {
    event.preventDefault(); // Prevent default anchor behavior
    this.classList.add('ph-active'); // Add class to anchor
    this.querySelector('span').classList.add('tracking-out-contract'); // Add class to span

    this.querySelector('span.ph-btn__extra').classList.add('tracking-in-expand'); // Add class to span
};


// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDn0sppQ-6k3aXwKze7CIdHYIUt0WmuiDo",
//   authDomain: "mulu-yu-kalam-76d03.firebaseapp.com",
//   projectId: "mulu-yu-kalam-76d03",
//   storageBucket: "mulu-yu-kalam-76d03.appspot.com",
//   messagingSenderId: "287033036710",
//   appId: "1:287033036710:web:da4f91a47ef8c3950fc967",
//   measurementId: "G-1PQDPMD63G"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);