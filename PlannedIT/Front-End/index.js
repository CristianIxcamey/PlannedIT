//Firebase
let submit = document.getElementById("create")
firebase.initializeApp({
    apiKey: 'AIzaSyDOzxFLuKTo71jrcRzzGMHyHwSsalXPeTo',
    authDomain: 'plannedit-bc972.firebaseapp.com',
    databaseURL: "https://plannedit-bc972.firebaseio.com",
    projectId: 'plannedit-bc972'
});
var db = firebase.firestore();
const menuIcon = document.getElementById("menuIcon");

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

        .when('/viewEvent/:userId/:index', {
            templateUrl: 'pages/event.html',
            controller: 'eventController'
        })

        .when('/addEvent', {
            templateUrl: 'pages/createEvent.html',
            controller: 'createEventController'
        })

        .when('/editEvent/:userId/:index', {
            templateUrl: 'pages/createEvent.html',
            controller: 'updateEventController'
        })

        .when('/invitations', {
            templateUrl: 'pages/invitations.html',
            controller: 'invitationsController'
        })

        .when('/friends', {
            templateUrl: 'pages/friends.html',
            controller: 'friendsController'
        })

        .when('/friendSchedule/:id', {
            templateUrl: 'pages/friendSchedule.html',
            controller: 'friendScheduleController'
        })

        .when('/addFriend', {
            templateUrl: 'pages/addFriend.html',
            controller: 'addFriendController'
        })

        .when('/profile', {
            templateUrl: 'pages/profile.html',
            controller: 'profileController'
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
            document.getElementsByTagName("nav")[0].style.display = "none";
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
        menuIcon.style.display = "flex";
        var data = '';
        const user = firebase.auth().currentUser;
        let docref = db.collection('Users').doc(user.uid)
        docref.get().then(function (doc) {
            data = doc.data();
            $scope.fn1();
        });

        $scope.fn1 = _ => {
            document.getElementById("greeting").innerHTML = `Welcome back ${data.name}`;
            document.getElementById("loadingSection").style.display = "none";
            $scope.events = data.schedule;

            $scope.$apply();
        };

        $scope.viewEvent = index => {
            window.location.href = `/#!/viewEvent/${user.uid}/${index}`;
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

app.controller('profileController', function ($scope) {
    if (firebase.auth().currentUser != null) {
        const user = firebase.auth().currentUser;
        const docref = db.collection('Users').doc(user.uid);
        docref.get().then(function (doc) {
            $scope.loadUser(doc.data());
        });

        $scope.loadUser = userData => {
            $scope.user = userData;
            $scope.$apply();
            console.log(userData);
        }

    } else {
        window.location.href = '/#!/';
    }
});

app.controller("invitationsController", function ($scope) {
    if (firebase.auth().currentUser != null) {

    } else {
        window.location.href = '/#!/';
    }
});

app.controller('eventController', function ($scope, $routeParams) {
    if (firebase.auth().currentUser != null) {
        const userID = firebase.auth().currentUser.uid;
        const userRef = db.collection('Users').doc($routeParams.userId);
        let userData = null;
        let event = null;
        userRef.get().then(function (doc) {
            userData = doc.data()
            $scope.loadEvent(doc.data());
        });

        $scope.loadEvent = userData => {
            event = userData.schedule[$routeParams.index];
            event.e_Start_Time = event.e_Start_Time.toDate().toUTCString();
            event.e_End_Time = event.e_End_Time.toDate().toUTCString();
            $scope.event = event;
            $scope.list = event.attendees;
            $scope.$apply();
        };

        if (userID == $routeParams.userId) {
            $scope.editEvent = _ => {
                window.location.href = `/#!/editEvent/${userID}/${$routeParams.index}`;
            };

            $scope.deleteEvent = _ => {
                const user = firebase.auth().currentUser;
                let newEventarray = []

                userData.schedule.forEach(event => {
                    if (event.e_Name != event.e_Name) {
                        newEventarray.push(event);
                    };
                });

                var docRef = db.collection("Users").doc(user.uid);
                docRef.update({
                    schedule: newEventarray
                });
                window.location.href = '/#!/home';
            };
        } else {
            document.getElementById("creatorOptions").style.display = "none";
        }

    } else {
        window.location.href = '/#!/';
    }

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

app.controller('updateEventController', function ($scope, $routeParams) {
    if (firebase.auth().currentUser != null) {
        const userID = firebase.auth().currentUser.uid;
        if (userID == $routeParams.userId) {
            let userData = null;
            let event = null;
            let masterName = "";
            const userRef = db.collection('Users').doc($routeParams.userId);
            userRef.get().then(function (doc) {
                userData = doc.data();
                $scope.loadEvent(doc.data());
            });

            $scope.loadEvent = userData => {
                masterName = userData.username;
                event = userData.schedule[$routeParams.index];
                console.log(event);
                $scope.list = [];
                event.attendees.forEach(attendee => {
                    $scope.list.push({ "user": attendee });
                });
                document.getElementById("subButton").innerHTML = "Update event";
                $scope.eventName = event.e_Name;
                $scope.eventDescription = event.e_Description;
                $scope.eventAddress = event.e_Location;
                $scope.dateS = event.e_Start_Time.toDate();
                $scope.dateE = event.e_End_Time.toDate();
                $scope.$apply();
            };

            $scope.Submit = _ => {
                const user = firebase.auth().currentUser;
                const newEventarray = [];
                const finalAttendees = [];

                $scope.list.forEach(element => {
                    finalAttendees.push(element.user);
                });

                userData.schedule.forEach(event => {
                    if (event.e_Name == event.e_Name) {
                        let newEvent = {
                            attendees: finalAttendees,
                            e_Name: $scope.eventName,
                            e_Master: masterName,
                            e_Description: $scope.eventDescription,
                            e_Location: $scope.eventAddress,
                            e_Start_Time: $scope.dateS,
                            e_End_Time: $scope.dateE
                        }
                        event = newEvent;
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
        } else {
            window.location.href = '/#!/';
        }
    } else {
        window.location.href = '/#!/';
    }

});

app.controller('friendsController', function ($scope) {
    if (firebase.auth().currentUser != null) {
        let data = '';
        const user = firebase.auth().currentUser;
        let docref = db.collection('Users').doc(user.uid)
        docref.get().then(function (doc) {
            data = doc.data();
            $scope.loadRequests();
        });

        $scope.loadRequests = _ => {
            $scope.friendRequests = data.friendRequests;
            $scope.friends = data.friends;
            $scope.$apply();
        }

        $scope.addFriend = index => {
            const reqUserRef = db.collection('Users').doc(data.friendRequests[index].id);
            const requestingUserPromise = getReqData(data.friendRequests[index].id);
            requestingUserPromise.then(function (val) {
                for (var i = 0; i < val.pendingFriends.length; i++) {
                    if (val.pendingFriends[i].username == data.username) {
                        val.friends.push(val.pendingFriends[i]);
                        val.pendingFriends.splice(i, 1);
                    };
                };
                data.friends.push(data.friendRequests[index]);
                data.friendRequests.splice(index, 1);
                reqUserRef.update({
                    pendingFriends: val.pendingFriends,
                    friends: val.friends
                });
                docref.update({
                    friendRequests: data.friendRequests,
                    friends: data.friends
                });
                $scope.friends = data.friends;
                $scope.friendRequests = data.friendRequests;
                $scope.$apply();
            });
        }

        $scope.declineFriend = index => {
            let requestorRef = db.collection('Users').doc(data.friendRequests[index].id);
            const requestorPromise = getReqData(data.friendRequests[index].id);
            requestorPromise.then(function (val) {
                for (let i = 0; i < val.pendingFriends.length; i++) {
                    if (val.pendingFriends[i].username == data.username) {
                        val.pendingFriends.splice(i, 1);
                        requestorRef.update({
                            pendingFriends: val.pendingFriends
                        });
                    };
                };
                data.friendRequests.splice(index, 1);
                docref.update({
                    friendRequests: data.friendRequests
                });
                $scope.friendRequests = data.friendRequests;
                $scope.$apply();
            });
        }

        $scope.deleteFriend = index => {
            let friendRef = db.collection('Users').doc(data.friends[index].id);
            const friendPromise = getReqData(data.friends[index].id);
            friendPromise.then(function (val) {
                for (let i = 0; i < val.friends.length; i++) {
                    if (val.friends[i].username == data.username) {
                        val.friends.splice(i, 1);
                        friendRef.update({
                            friends: val.friends
                        });
                    };
                };
                data.friends.splice(index, 1);
                docref.update({
                    friends: data.friends
                });
                $scope.friends = data.friends;
                $scope.$apply();
            });
        }

        $scope.viewSchedule = index => {
            window.location.href = '/#!/friendSchedule/' + data.friends[index].id;
        }

        $scope.searchFriends = _ => {
            window.location.href = '/#!/addFriend';
        }


    } else {
        window.location.href = '/#!/';
    }
});

app.controller('friendScheduleController', function ($scope, $routeParams) {
    if (firebase.auth().currentUser != null) {
        const userRef = db.collection('Users').doc($routeParams.id);
        userRef.get().then(function (doc) {
            $scope.loadSchedule(doc.data());
        });

        $scope.loadSchedule = userData => {
            $scope.user = userData;
            $scope.events = userData.schedule;
            $scope.$apply();
        };

        $scope.viewEvent = index => {
            window.location.href = `/#!/viewEvent/${$routeParams.id}/${index}`;
        }
    } else {
        window.location.href = '/#!/';
    }
});

app.controller('addFriendController', function ($scope) {
    if (firebase.auth().currentUser != null) {
        let addSection = document.getElementsByClassName("userInfoSection")
        let documents = null;
        let userData = [];
        let friend = null;
        let currUser = [];
        const user = firebase.auth().currentUser;
        let userRef = db.collection('Users').doc(user.uid);
        userRef.get().then(function (res) {
            $scope.reset();
            currUser.push(res);
            currUser.push(res.data());
        });

        let docref = db.collection('Users');
        docref.get().then(function (res) {
            documents = res.docs;
            documents.forEach(doc => {
                userData.push(doc);
            });
        });

        $scope.search = _ => {
            let userFound = false;
            let userToAdd = [];
            userData.forEach(user => {
                if (currUser[1].username == $scope.searchTxt) {
                    $scope.reset();
                    notie.alert({ type: 3, text: 'Cannot add yourself, sorry' });
                    userFound = true;
                } else if (user.data().username == $scope.searchTxt) {
                    userToAdd.push(user)
                    userToAdd.push(user.data());
                    userFound = true;
                    $scope.displayUser(userToAdd);
                };
            });
            if (userFound == false) {
                $scope.reset();
                notie.alert({ type: 3, text: 'Could not find user, please try again' });
            }
        };

        $scope.displayUser = userToAdd => {
            friend = {
                id: userToAdd[0].id,
                img: userToAdd[1].profileImage,
                name: userToAdd[1].name,
                email: userToAdd[1].email,
                username: userToAdd[1].username
            };
            $scope.user = friend;
            addSection[0].style.display = "block";
        };

        $scope.addFriend = _ => {
            let alreadyPending = false;

            currUser[1].pendingFriends.forEach(penFriend => {
                if (penFriend.username == friend.username) {
                    alreadyPending = true;
                }
            });

            if (alreadyPending == false) {
                userRef.update({
                    pendingFriends: firebase.firestore.FieldValue.arrayUnion(friend)
                });

                let currentUser = {
                    id: currUser[0].id,
                    img: currUser[1].profileImage,
                    name: currUser[1].name,
                    email: currUser[1].email,
                    username: currUser[1].username
                };

                db.collection('Users').doc(friend.id).update({
                    friendRequests: firebase.firestore.FieldValue.arrayUnion(currentUser)
                });
            };
            $scope.reset();
            notie.alert({ type: 1, text: 'Friend request sent!' });
        }

        $scope.reset = _ => {
            addSection[0].style.display = "none";
            $scope.searchTxt = "";
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

async function getReqData(id) {
    let res = null;
    let reqRef = db.collection('Users').doc(id);
    await reqRef.get().then(function (doc) {
        res = doc.data()
    });
    return res;
}

const sessionStat = _ => {
    if (firebase.auth().currentUser.uid != null) {
        // window.location.href = '/#!/home';
    }
}

const menuFunction = _ => {
    let menuCont = document.getElementById("menuContent");
    if (menuCont.style.display == "none") {
        menuCont.style.display = "flex";
        menuIcon.innerHTML = "&#9776;";
    } else {
        menuCont.style.display = "none";
        menuIcon.innerHTML = "&#10006;";
    }
}
menuIcon.addEventListener('click', menuFunction);
