// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken,onMessage } from "firebase/messaging";


const firebaseConfig = {
  apiKey: "AIzaSyDtHuT6kprvEXHvlCuYyJ5GAvOKYRVsFdo",
  authDomain: "mytodolist-95.firebaseapp.com",
  projectId: "mytodolist-95",
  storageBucket: "mytodolist-95.appspot.com",
  messagingSenderId: "497562446045",
  appId: "1:497562446045:web:5ef18e42c191f79b5a9334",
  measurementId: "G-58SHLV45BR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  db,
  storage,
  app // Export the storage object
};




// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
const messaging = getMessaging();
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // ...
});
getToken(messaging, { vapidKey: 'BGzQLsJ0e7OMEi6xiPxB3k9sScpYN03jkA9PL0bTa9Tr48x5KRTBt6bm0Jf3DLV-qVnpP0KYp4kAggQ2nbYt_Z8' }).then((currentToken) => {
  if (currentToken) {
    console.log("the token is:", currentToken)
    // Send the token to your server and update the UI if necessary
    // ...
  } else {
    // Show permission request UI
    console.log('No registration token available. Request permission to generate one.');
    // ...
  }
}).catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
  // ...
});
