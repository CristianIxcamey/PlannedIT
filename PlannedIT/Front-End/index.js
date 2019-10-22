//Firebase
let submit = document.getElementById("create")
firebase.initializeApp({
    apiKey: 'AIzaSyDOzxFLuKTo71jrcRzzGMHyHwSsalXPeTo',
    authDomain: 'plannedit-bc972.firebaseapp.com',
    databaseURL: "https://plannedit-bc972.firebaseio.com",
    projectId: 'plannedit-bc972'
});
var db = firebase.firestore();
// var userData = null;
var userEvents = [];
let currentEvent = {};
var docId = 0;
var dateS = '';
var dateE = '';

//AngularJS
let app = angular.module('PlannedIT', ['ngRoute']);
app.config($routeProvider => {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/landingPage.html',
            controller: "landingController"
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

        .when('/viewEvent/:event', {
            templateUrl: 'pages/event.html',
            controller: 'eventController'
        })

        .when('/addEvent', {
            templateUrl: 'pages/createEvent.html',
            controller: 'createEventController'
        })

        .when('/editEvent/:event', {
            templateUrl: 'pages/createEvent.html',
            controller: 'updateEventController'
        })

        .when('/profile', {
            templateUrl: 'pages/profile.html',
            controller: 'updateEventController'
        })

        .when('/addFriend', {
            templateUrl: 'pages/addFriend.html',
            controller: 'addFriendController'
        })
});

//AngularJS controllers
app.controller('mainController', function ($scope) {

});

app.controller('landingController', function ($scope) {
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
})

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
        var data = '';
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
            window.location.href = `/#!/viewEvent/${userEvents[index].e_Name}`;
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
    dateS = currentEvent.e_Start_Time;
    dateE = currentEvent.e_End_Time;
    $scope.event = currentEvent;
    $scope.list = currentEvent.attendees;
    $scope.event.e_Start_Time = currentEvent.e_Start_Time.toDate().toUTCString();
    $scope.event.e_End_Time = currentEvent.e_End_Time.toDate().toUTCString();
    $scope.editEvent = _ => {
        window.location.href = `/#!/editEvent/${currentEvent.e_Name}`;
    };

    $scope.deleteEvent = _ => {
        const user = firebase.auth().currentUser;
        let newEventarray = []

        userEvents.forEach(event => {
            if (event.e_Name != currentEvent.e_Name) {
                newEventarray.push(event);
            };
        });

        var docRef = db.collection("Users").doc(user.uid);
        docRef.update({
            schedule: newEventarray
        });
        window.location.href = '/#!/home';
    };
});

app.controller('createEventController', function ($scope) {
    const user = firebase.auth().currentUser;
    $scope.Submit = _ => {
        let finalAttendees = [];
        $scope.list.forEach(element => {
            finalAttendees.push(element.user);
        });
        let event = {
            attendees: finalAttendees,
            e_Name: $scope.eventName,
            e_Master: "tester",
            e_Description: $scope.eventDescription,
            e_Location: $scope.eventAddress,
            e_Start_Time: $scope.dateS,
            e_End_Time: $scope.dateE
        }
        var docRef = db.collection("Users").doc(user.uid);

        docRef.update({
            schedule: firebase.firestore.FieldValue.arrayUnion(event)
        });

        window.location.href = '/#!/home';
    };

    $scope.list = [];

    $scope.userAdd = _ => {
        $scope.list.push({ "user": $scope.addedAttendee });
        $scope.addedAttendee = "";
    }

    $scope.remove = index => {
        let newUserList = $scope.list;
        $scope.list = [];
        newUserList.forEach(user => {
            if (user.user != newUserList[index].user) {
                $scope.list.push(user);
            };
        });

    }
});

app.controller('updateEventController', function ($scope) {
    $scope.list = [];
    currentEvent.attendees.forEach(attendee => {
        $scope.list.push({ "user": attendee });
    });
    document.getElementById("subButton").innerHTML = "Update event";
    $scope.eventName = currentEvent.e_Name;
    $scope.eventDescription = currentEvent.e_Description;
    $scope.eventAddress = currentEvent.e_Location;
    $scope.dateS = dateS.toDate();
    $scope.dateE = dateE.toDate();


    $scope.Submit = _ => {
        const user = firebase.auth().currentUser;
        const newEventarray = [];
        const finalAttendees = [];

        $scope.list.forEach(element => {
            finalAttendees.push(element.user);
        });

        userEvents.forEach(event => {
            if (event.e_Name == currentEvent.e_Name) {
                let newEvent = {
                    attendees: finalAttendees,
                    e_Name: $scope.eventName,
                    e_Master: "tester",
                    e_Description: $scope.eventDescription,
                    e_Location: $scope.eventAddress,
                    e_Start_Time: $scope.dateS,
                    e_End_Time: $scope.dateE
                }
                currentEvent = newEvent;
                newEventarray.push(newEvent);
            } else {
                newEventarray.push(event);
            }
        });

        var docRef = db.collection("Users").doc(user.uid);
        docRef.update({
            schedule: newEventarray
        });
        window.location.href = '/#!/home';
    };

    $scope.userAdd = _ => {
        $scope.list.push({ "user": $scope.addedAttendee });
        $scope.addedAttendee = "";
    }

    $scope.remove = index => {
        let newUserList = $scope.list;
        $scope.list = [];
        newUserList.forEach(user => {
            if (user.user != newUserList[index].user) {
                $scope.list.push(user);
            };
        });

    };
});

app.controller('addFriendController', function ($scope) {
    if (firebase.auth().currentUser != null) {
        let addSection = document.getElementById("userInfoSection")
        let documents = null;
        let userData = [];
        let friend = null;
        let docref = db.collection('Users')
        const user = firebase.auth().currentUser;

        docref.get().then(function (res) {
            documents = res.docs;
            documents.forEach(doc => {
                userData.push(doc);
            });
        });

        $scope.search = _ => {
            let userFound = false;
            let currUser = null;
            userData.forEach(user => {
                if (user.data().name == $scope.searchTxt) {
                    currUser = user;
                    userFound = true;
                };
            });
            if (userFound == false) {
                addSection.style.display = "none";
                notie.alert({ type: 3, text: 'Could not find user, please try again' });
            } else {
                $scope.displayUser(currUser);
            }
        };

        $scope.displayUser = currUser => {
            friend = currUser;
            $scope.user = {
                img: currUser.profileImage,
                name: currUser.name,
                email: currUser.email
            };
            addSection.style.display = "block";
        };

        $scope.addFriend = _ => {
            console.log(friend);
        }
    } else {
        window.location.href = '/#!/';
    }
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
        // window.location.href = '/#!/home';
    }
}