//Firebase
let submit = document.getElementById("create")
firebase.initializeApp({
    apiKey: 'AIzaSyDOzxFLuKTo71jrcRzzGMHyHwSsalXPeTo',
    authDomain: 'plannedit-bc972.firebaseapp.com',
    databaseURL: "https://plannedit-bc972.firebaseio.com",
    projectId: 'plannedit-bc972'
});
var db = firebase.firestore();
var userData = null;
var userEvents = [];
currentEvent = {};

//AngularJS
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

        .when('/edtevent/:event', {
            templateUrl: 'pages/event.html',
            controller: 'eventController'
        })

        .when('/addEvent', {
            templateUrl: 'pages/createEvent.html',
            controller: 'createEventController'
        })
});

//AngularJS controllers
app.controller('mainController', function ($scope) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            window.location.href = '/#!/home';
        } else {
            $scope.login = function () {
                window.location.href = '/#!/login';
            }

            $scope.singup = function () {
                window.location.href = '/#!/singup';
            }
        }
    });
});

app.controller('loginController', function ($scope) {
    if (firebase.auth().currentUser != null) {
        window.location.href = '/#!/home';
    }
    //Login
    $scope.login = async function login() {
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;
        console.log(`The email is ${email} and the password is ${password}`);
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(async function () {
                await firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(`There was an error ${errorCode} with the message ${errorMessage}`);
                    notie.alert({ type: 3, text: 'Email and/or password are incorrect' })
                    // ...
                });
                if (firebase.auth().currentUser.uid != null) {
                    window.location.href = '/#!/home';
                }
            });
    };

    $scope.singup = function () {
        window.location.href = '/#!/singup';
    }
});

app.controller('singUpController', function ($scope) {
    if (firebase.auth().currentUser != null) {
        window.location.href = '/#!/home';
    }
    //sign up
    // let submit = document.getElementById("singUp")

    $scope.createUser = async function () {
        let newuser = $scope.user
        await firebase.auth().createUserWithEmailAndPassword(newuser.email, newuser.password).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(`There was an error ${errorCode} with the message ${errorMessage}`);
            notie.alert({ type: 3, text: 'This email is already in use' })
        })
            .then(() => {
                const user = firebase.auth().currentUser;
                if (user != null) {
                    let scheme = {
                        name: newuser.name,
                        email: newuser.email,
                        username: newuser.username,
                        profileImage: "https://www.pinclipart.com/picdir/middle/181-1814767_person-svg-png-icon-free-download-profile-icon.png",
                        schedule: [
                            {
                                attendees: ["user1", "user2"],
                                e_Description: "this is a tester event",
                                e_End_Time: toTimestamp(2019, 11, 8, 16, 00, 00),
                                e_Start_Time: toTimestamp(2019, 11, 08, 12, 30, 00),
                                e_Location: "3873 S. Sennie Dr.",
                                e_Master: newuser.name,
                                e_Name: "event1"
                            }
                        ]
                    }
                    db.collection("Users")
                        .doc(user.uid)
                        .set(scheme)
                };
            });
        window.location.href = '/#!/home';
    }

    $scope.login = function () {
        window.location.href = '/#!/login';
    }

});

app.controller('homeController', function ($scope) {
    if (firebase.auth().currentUser != null) {
        var data = userData;
        const user = firebase.auth().currentUser;
        let docref = db.collection('Users').doc(user.uid)
        docref.get().then(function (doc) {
            data = doc.data();
            $scope.fn1();
        });

        $scope.fn1 = _ => {
            document.getElementById("greeting").innerHTML = `Welcome back ${data.name}`;
            userEvents = data.schedule;
            $scope.events = userEvents;

            $scope.$apply();
        };

        $scope.viewEvent = index => {
            currentEvent = userEvents[index];
            window.location.href = `/#!/edtevent/${userEvents[index].e_Name}`;
        }

        $scope.singOut = _ => {
            firebase.auth().signOut().then(function () {
                window.location.href = `/#!/`;
            }, function (error) {
                console.log(error)
            });
        };

        $scope.createEvent = _ => {
            window.location.href = `/#!/addEvent`;
        }
    } else {
        window.location.href = '/#!/';
    }
});

app.controller('eventController', function ($scope) {
    console.log(currentEvent.e_End_Time)
    $scope.eventName = currentEvent.e_Name;
    $scope.eventMaster = currentEvent.e_Master;
    $scope.setDate = _ => {
        console.log($scope.date);
    }
});

app.controller('createEventController', function ($scope) {

});

// Dragula
// const Create_Event_Section = document.getElementById("eventCreationSection");
// const Schedule_Section = document.getElementById("scheduleSection");

// dragula([Create_Event_Section, Schedule_Section]), {
//     revertOnSpill: true
// };

//Additional Functions
function toTimestamp(year, month, day, hour, minute, second) {
    var datum = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    console.log(datum);
    return datum;
}

const sessionStat = _ => {
    if (firebase.auth().currentUser.uid != null) {
        window.location.href = '/#!/home';
    }
}