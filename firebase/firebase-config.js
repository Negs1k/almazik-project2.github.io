const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    databaseURL: ""
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();