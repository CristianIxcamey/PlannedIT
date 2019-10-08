//Firebase
let submit = document.getElementById("create")

firebase.initializeApp({
    apiKey: 'AIzaSyDOzxFLuKTo71jrcRzzGMHyHwSsalXPeTo',
    authDomain: 'plannedit-bc972.firebaseapp.com',
    databaseURL: "https://plannedit-bc972.firebaseio.com",
    projectId: 'plannedit-bc972'
});

var db = firebase.firestore();




function toTimestamp(year, month, day, hour, minute, second) {
    var datum = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return datum.getTime() / 1000;
}

let app = angular.module('PlannedIT', ['ngRoute']);
app.config($routeProvider => {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/landingPage.html',
            controller: "mainController"
        })

        .when('/login', {
            templateUrl: 'pages/login.html',
            controller: 'loginController'
        })

        .when('/singup', {
            templateUrl: 'pages/singup.html',
            controller: 'singUpController'
        })

        .when('/home', {
            templateUrl: 'pages/home.html',
            controller: 'homeController'
        })
});

app.controller('mainController', function ($scope, $http, $window) {
    let login = document.getElementById("login");
    let signup = document.getElementById("signup");

    login.addEventListener('click', _ => {
        
    });
});

app.controller('loginController', function ($scope, $http, $window) {
    //Login
    let login = document.getElementById("login");

    login.addEventListener('click', async function login() {
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;
        console.log(`The email is ${email} and the password is ${password}`);
        await firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(`There was an error ${errorCode} with the message ${errorMessage}`);
            // ...
        });
        const user = firebase.auth().currentUser;

        if (user != null) {
            let docref = db.collection('Users').doc(user.uid);
            docref.get().then(function (doc) {
                console.log(doc.data());
            });
            // console.log(user)
        }
    });
});

app.controller('singUpController', function ($scope, $http, $window) {
    //sign up
    let submit = document.getElementById("singUp")

    submit.addEventListener('click', async function signUp() {
        await firebase.auth().createUserWithEmailAndPassword("Tester@test.com", "tester").catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(`There was an error ${errorCode} with the message ${errorMessage}`);
        })
            .then(() => {
                const user = firebase.auth().currentUser;
                if (user != null) {
                    let scheme = {
                        name: "tester",
                        email: "Tester@test.com",
                        username: "tester1",
                        profileImage: "https://www.pinclipart.com/picdir/middle/181-1814767_person-svg-png-icon-free-download-profile-icon.png",
                        schedule: {
                            event1: {
                                attendees: ["user1", "user2"],
                                e_Description: "this is a tester event",
                                e_End_Time: toTimestamp(2019, 10, 8, 16, 00, 00),
                                e_Start_Time: toTimestamp(2019, 10, 08, 12, 30, 00),
                                e_Location: "3873 S. Sennie Dr.",
                                e_Master: "tester",
                                e_Name: "event1"
                            }
                        }
                    }
                    db.collection("Users")
                        .doc(user.uid)
                        .set(scheme)
                };
            });
    });

});

app.controller('singUpController', function ($scope, $http, $window) {

});

// Dragula
// const Create_Event_Section = document.getElementById("eventCreationSection");
// const Schedule_Section = document.getElementById("scheduleSection");

// dragula([Create_Event_Section, Schedule_Section]), {
//     revertOnSpill: true
// };



