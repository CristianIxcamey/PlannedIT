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
const loadingSection = document.getElementById("loadingSection");
const appSection = document.getElementById("application");
const googleCalendarCredentials = {
    apiKey: 'AIzaSyAGSka3Fko8L5zDhYwujTlb0KbIDD-ohec',
    clientId: '335758049131-3ig38tgsdar335913ofuvui9rja1dcnb.apps.googleusercontent.com',
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    scope: "https://www.googleapis.com/auth/calendar"
}

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

        .when('/viewEvent/:userId/:eventID', {
            templateUrl: 'pages/event.html',
            controller: 'eventController'
        })

        .when('/addEvent', {
            templateUrl: 'pages/createEvent.html',
            controller: 'createEventController'
        })

        .when('/editEvent/:userId/:eventID', {
            templateUrl: 'pages/createEvent.html',
            controller: 'updateEventController'
        })

        .when('/invitations', {
            templateUrl: 'pages/invitations.html',
            controller: 'invitationsController'
        })

        .when('/invitations/view/:userId/:eventID', {
            templateUrl: 'pages/viewInvitations.html',
            controller: 'viewInvitationsController'
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
            isloading(true);
        }
    });
})

app.controller('loginController', function ($scope) {
    //Login
    $scope.login = async function login() {
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(async function () {
                await firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    notie.alert({ type: 3, text: 'Email and/or password are incorrect' })
                    // ...
                });
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
    //Steps logic
    const steps = document.getElementsByClassName("logSingSection");
    let stepIndex = 0;
    steps[1].style.display = "none";
    document.getElementById("back").style.display = "none";
    $scope.nextStep = _ => {
        steps[stepIndex].style.display = "none";
        stepIndex++;
        steps[stepIndex].style.display = "flex";
        if (stepIndex == steps.length - 1) {
            document.getElementById("next").style.display = "none";
            document.getElementById("back").style.display = "block";
            document.getElementById("subButton").style.display = "block";
        } else {
            document.getElementById("back").style.display = "block";
            document.getElementById("subButton").style.display = "none";
        }
    }

    $scope.lastStep = _ => {
        steps[stepIndex].style.display = "none";
        stepIndex--;
        steps[stepIndex].style.display = "flex";
        if (stepIndex == 0) {
            document.getElementById("subButton").style.display = "none";
            document.getElementById("back").style.display = "none";
            document.getElementById("next").style.display = "block";
        } else {
            document.getElementById("next").style.display = "block";
            document.getElementById("subButton").style.display = "none";
        }
    }

    $scope.createUser = async function () {
        let newuser = $scope.user
        await firebase.auth().createUserWithEmailAndPassword(newuser.email, newuser.password).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            notie.alert({ type: 3, text: 'This email is already in use' })
        })
            .then(() => {
                const user = firebase.auth().currentUser;
                if (user != null) {
                    let scheme = {
                        name: newuser.name,
                        email: newuser.email,
                        username: newuser.username,
                        profileImage: "https://i.dailymail.co.uk/i/pix/2017/04/20/13/3F6B966D00000578-4428630-image-m-80_1492690622006.jpg",
                        schedule: [],
                        allowGAPI: false,
                        friendRequests: [],
                        friends: [],
                        invitations: [],
                        pendingFriends: [],
                    }
                    db.collection("Users").doc(user.uid).set(scheme)
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
        document.getElementsByTagName("nav")[0].style.display = "flex";
        menuIcon.style.display = "flex";
        var data = '';
        const user = firebase.auth().currentUser;
        let docref = db.collection('Users').doc(user.uid)
        docref.get().then(function (doc) {
            data = doc.data();
            $scope.load();
        });

        $scope.load = _ => {
            document.getElementById("greeting").innerHTML = `Welcome back ${data.name}`;
            isloading(true);
            $scope.events = data.schedule;
            $scope.events.forEach(event => {
                event.e_Start_Time = event.e_Start_Time.toDate().toLocaleDateString('en-us', { dateStyle: "medium", timeStyle: "medium" });
            });
            $scope.$apply();
        };

        $scope.viewEvent = index => {
            let event = getEvent(data.schedule, data.schedule[index].id);
            window.location.href = `/#!/viewEvent/${user.uid}/${event.id}`;
        }

        $scope.singOut = _ => {
            firebase.auth().signOut().then(function () {
                window.location.href = `/#!/`;
            }, function (error) {
                console.log(error)

            });
        };

        $scope.createEvent = _ => {
            isloading(false);
            window.location.href = `/#!/addEvent`;
        }
    } else {
        window.location.href = '/#!/';
    }
});

app.controller('profileController', function ($scope, $interval) {
    isloading(false);
    let loadingCount = 0;
    let loadingInterval = $interval(function () {
        if (firebase.auth().currentUser != null) {

            const user = firebase.auth().currentUser;
            const docref = db.collection('Users').doc(user.uid);
            docref.get().then(function (doc) {
                $scope.loadUser(doc.data());
            });

            $scope.loadUser = userData => {
                isloading(true);
                $scope.user = userData;
                $scope.$apply();
            }

            // initClient();

            $interval.cancel(loadingInterval);
        } else if (loadingCount == 5) {
            window.location.href = '/#!/';
        } else {
            loadingCount += 1;
        }
    }, 1000);

});

app.controller("invitationsController", function ($scope, $interval) {
    isloading(false);
    let loadingCount = 0;
    let loadingInterval = $interval(function () {
        if (firebase.auth().currentUser != null) {
            const user = firebase.auth().currentUser;
            let userData;
            const userRef = db.collection('Users').doc(user.uid);

            userRef.get().then(function (doc) {
                userData = doc.data();
                $scope.loadData();
            });

            $scope.loadData = _ => {
                let data = userData.invitations;
                for (let i = 0; i < data.length; i++) {
                    data[i].eventStart = data[i].eventStart.toDate().toUTCString();
                    data[i].eventEnd = data[i].eventEnd.toDate().toUTCString();
                };
                $scope.invitations = data;
                $scope.$apply();
                isloading(true);

            };

            $scope.eventOptions = index => {
                const event = getEvent(userData.invitations, userData.invitations[index].id);
                let originalEvent;
                const inviteRef = db.collection('Users').doc(event.masterID);
                const newInvitationList = [];
                inviteRef.get().then(function (doc) {
                    const docData = doc.data();
                    originalEvent = getEvent(docData.schedule, event.id);
                });

                userData.invitations.forEach(invite => {
                    if (invite.eventTitle != userData.invitations[index].eventTitle) {
                        newInvitationList.push(invite);
                    }
                });

                notie.select({
                    text: "Event Options",
                    choices: [
                        {
                            type: 1,
                            text: 'Accept Invitation',
                            handler: function () {
                                userRef.update({
                                    schedule: firebase.firestore.FieldValue.arrayUnion(originalEvent),
                                    invitations: newInvitationList
                                });
                                notie.alert({ type: 1, text: 'Invitation Accepted' })
                            }
                        },
                        {
                            type: 3,
                            text: "Deny Invitation",
                            handler: function () {
                                userRef.update({
                                    invitations: newInvitationList
                                });
                                notie.alert({ type: 3, text: 'Invitation Denied' })
                            }
                        },
                        {
                            type: 4,
                            text: "View Event Information",
                            handler: function () {
                                window.location.href = `/#!/invitations/view/${userData.invitations[index].masterID}/${userData.invitations[index].eventId}`;
                            }
                        }
                    ]

                });
            }
            $interval.cancel(loadingInterval);
        } else if (loadingCount == 5) {
            window.location.href = '/#!/';
        } else {
            loadingCount += 1;
        }
    }, 1000);
});

app.controller("viewInvitationsController", function ($scope, $routeParams, $interval) {
    isloading(false);
    let loadingCount = 0;
    let loadingInterval = $interval(function () {
        if (firebase.auth().currentUser != null) {
            const currUserRef = db.collection("Users").doc(firebase.auth().currentUser.uid);
            let currUserData;
            const userRef = db.collection('Users').doc($routeParams.userId);
            let userData;
            let event;
            let invitations;
            let start;
            let end
            userRef.get().then(function (doc) {
                userData = doc.data();
                event = getEvent(userData.schedule, $routeParams.eventID);
                $scope.loadEvent();
            });

            currUserRef.get().then(function (doc) {
                currUserData = doc.data();
                invitations = currUserData.invitations;
                for (let i = 0; i < invitations.length; i++) {
                    if (event.id == invitations[i].eventId) {
                        invitations.splice(i, 1);
                    }
                }
            });

            $scope.loadEvent = _ => {
                $scope.event = event;
                start = event.e_Start_Time;
                end = event.e_End_Time;
                $scope.event.e_Start_Time = event.e_Start_Time.toDate().toLocaleDateString('en-us', { dateStyle: "medium", timeStyle: "medium" });
                $scope.event.e_End_Time = event.e_End_Time.toDate().toLocaleDateString('en-us', { dateStyle: "medium", timeStyle: "medium" });
                $scope.prepareMap(event.e_Location);
                $scope.$apply();
                isloading(true);
            }

            $scope.prepareMap = address => {
                address = address.replace(/ /g, "+");
                let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}r&key=AIzaSyB8ycuAihiIlZOSaDa9hsamowjFvNIPI9s`;
                fetch(url, {
                })
                    .then(response => {
                        response.json().then(result => {
                            let longLat = result.results[0].geometry.location;
                            $scope.generateMap(longLat);
                        });
                    });
            }

            $scope.generateMap = longLat => {
                let map = new google.maps.Map(document.getElementById('map'), {
                    center: longLat,
                    zoom: 18,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                let mark = new google.maps.Marker({ position: longLat, title: "Address", visible: true });
                mark.setMap(map);
            }

            $scope.accept = _ => {
                const userSchedule = userData.schedule;
                userSchedule.some(element => {
                    if (element.id == $routeParams.eventID) {
                        element.attendees.some(attendee => {
                            if (attendee.userID == firebase.auth().currentUser.uid) {
                                attendee.hasAccepted = true;
                                return true;
                            }
                        });
                        element.e_Start_Time = start;
                        element.e_End_Time = end;
                        event = element;
                        return true;
                    }
                });


                currUserRef.update({
                    invitations: invitations,
                    schedule: firebase.firestore.FieldValue.arrayUnion(event)
                });

                //update attendance status on the original event for the current user


                userRef.update({
                    schedule: userSchedule
                });

                isloading(false);
                notie.alert({ type: 1, text: "Ivnitation Accepted" })
                window.location.href = '/#!/'
            }

            $scope.decline = _ => {
                currUserRef.update({
                    invitations: invitations
                });
                isloading(false);

                isloading(false);
                notie.alert({ type: 1, text: "Ivnitation Denied" })
                window.location.href = '/#!/'
            }

            $scope.counterReq = _ => {
                const timeConfig = {
                    altInput: true,
                    altFormat: "F j, Y h:i K",
                    enableTime: true,
                    dateFormat: "Z",
                }
                const dateStart = flatpickr("#StartDate", timeConfig);
                const dateEnd = flatpickr("#EndDate", timeConfig);
                document.getElementById("modal").style.display = "block";
            }

            $scope.counterSubmit = _ => {
                const startDate = firebase.firestore.Timestamp.fromDate(new Date($scope.dateS));
                const endDate = firebase.firestore.Timestamp.fromDate(new Date($scope.dateE));
                const counterReq = {
                    startTime: startDate,
                    endTime: endDate,
                    id: genID()
                };

                db.collection('Users').doc($routeParams.userId).collection("requests").doc($routeParams.eventID).set({
                    pending: firebase.firestore.FieldValue.arrayUnion(counterReq)
                });

                currUserRef.update({
                    invitations: invitations
                });
                isloading(false);
                notie.alert({ type: 1, text: 'Counter Request Sent' })
                window.location.href = '/#!/'
            }

            $scope.ModalCloseFunc = _ => {
                document.getElementById("modal").style.display = "none";
            }
            $interval.cancel(loadingInterval);
        } else if (loadingCount == 5) {
            window.location.href = '/#!/';
        } else {
            loadingCount += 1;
        }
    }, 1000);
});

app.controller('eventController', function ($scope, $routeParams, $interval, $route) {
    isloading(false);
    let loadingCount = 0;
    let loadingInterval = $interval(function () {
        if (firebase.auth().currentUser != null) {
            const userID = firebase.auth().currentUser.uid;
            const userRef = db.collection('Users').doc($routeParams.userId);
            const requestsRef = db.collection('Users').doc($routeParams.userId).collection("requests").doc($routeParams.eventID);
            let userData;
            let event;
            let eventRequests = [];

            userRef.get().then(function (doc) {
                userData = doc.data();
                $scope.loadEvent(doc.data());
            });

            $scope.loadEvent = userData => {
                event = getEvent(userData.schedule, $routeParams.eventID);
                $scope.prepareMap(event.e_Location);
                event.e_Start_Time = event.e_Start_Time.toDate().toLocaleDateString('en-us', { dateStyle: "medium", timeStyle: "medium" });
                event.e_End_Time = event.e_End_Time.toDate().toLocaleDateString('en-us', { dateStyle: "medium", timeStyle: "medium" });
                const confirmedAtt = [];
                event.attendees.forEach(element => {
                    if (element.hasAccepted) {
                        if (element.picture == "") {
                            element.picture = "/Images/userIcon2.png";
                        }
                        confirmedAtt.push(element);
                    };
                });
                $scope.event = event;
                $scope.list = confirmedAtt;
                $scope.requests = eventRequests;
                if (userData.username == event.e_Master && userID == $routeParams.userId) {
                    $scope.creatorOptions();
                }
                $scope.$apply();
                isloading(true);
            };

            $scope.prepareMap = address => {
                address = address.replace(/ /g, "+");
                let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}r&key=AIzaSyB8ycuAihiIlZOSaDa9hsamowjFvNIPI9s`;
                fetch(url, {
                })
                    .then(response => {
                        response.json().then(result => {
                            let longLat = result.results[0].geometry.location;
                            $scope.generateMap(longLat);
                        });
                    });
            }

            $scope.creatorOptions = _ => {

                document.getElementById("creatorOptions").style.display = "flex";
                requestsRef.get().then(function (doc) {
                    if (doc.data() != undefined) {
                        eventRequests = doc.data().pending;
                        eventRequests.forEach(element => {
                            element.startTime = element.startTime.toDate().toUTCString();
                            element.endTime = element.endTime.toDate().toUTCString();
                        });
                    }
                })
                $scope.editEvent = _ => {
                    window.location.href = `/#!/editEvent/${userID}/${$routeParams.eventID}`;
                };

                $scope.deleteEvent = _ => {
                    const user = firebase.auth().currentUser;
                    let newEventarray = []

                    userData.schedule.forEach(element => {
                        if (element.e_Name != event.e_Name) {
                            newEventarray.push(element);
                        };
                    });

                    var docRef = db.collection("Users").doc(user.uid);
                    docRef.update({
                        schedule: newEventarray
                    });
                    window.location.href = '/#!/home';
                };

                $scope.viewReq = _ => {
                    $scope.requests = eventRequests;
                    document.getElementById("modal").style.display = "block";
                }

                $scope.acceptReq = index => {

                    let startTimestamp = firebase.firestore.Timestamp.fromDate(new Date(eventRequests[index].startTime));
                    let endTimestamp = firebase.firestore.Timestamp.fromDate(new Date(eventRequests[index].endTime));
                    event.e_Start_Time = startTimestamp;
                    event.e_End_Time = endTimestamp;
                    const invitationEvent = {
                        eventTitle: event.e_Name,
                        eventMaster: event.e_Master,
                        masterID: userID,
                        eventDesc: event.e_Description,
                        eventLocation: event.e_Location,
                        eventId: event.id,
                        eventStart: event.e_Start_Time,
                        eventEnd: event.e_End_Time
                    };
                    event.attendees.forEach(user => {
                        if (!user.hasAccepted) {
                            db.collection('Users').doc(user.userID).get().then(function (doc) {
                                const resp = doc.data()
                                for (let i = 0; i < resp.invitations.length; i++) {
                                    if (resp.invitations[i].eventId == event.id) {
                                        resp.invitations.splice(i, 1);
                                    }
                                };
                                db.collection('Users').doc(user.userID).update({
                                    invitations: firebase.firestore.FieldValue.arrayUnion(invitationEvent)
                                });
                            });
                        };
                    });

                    for (let i = 0; i < userData.schedule.length; i++) {
                        if (userData.schedule[i].id == event.id) {
                            userData.schedule[i] = event;
                        }
                    }

                    userRef.update({
                        schedule: userData.schedule
                    })
                    $route.reload();
                }

                $scope.declineReq = index => {
                    eventRequests.splice(index, 1)
                }

                $scope.ModalCloseFunc = _ => {
                    document.getElementById("modal").style.display = "none";
                }
            }

            $scope.generateMap = longLat => {
                let map = new google.maps.Map(document.getElementById('map'), {
                    center: longLat,
                    zoom: 18,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                let mark = new google.maps.Marker({ position: longLat, title: "Address", visible: true });
                mark.setMap(map);
            }

            // Maps API Key AIzaSyB8ycuAihiIlZOSaDa9hsamowjFvNIPI9s

            $interval.cancel(loadingInterval);
        } else if (loadingCount == 5) {
            window.location.href = '/#!/';
        } else {
            loadingCount += 1;
        }
    }, 1000);

});

app.controller('createEventController', function ($scope, $interval) {
    isloading(false);
    let loadingCount = 0;
    let loadingInterval = $interval(function () {
        if (firebase.auth().currentUser != null) {
            const user = firebase.auth().currentUser;
            let userData;
            var docRef = db.collection("Users").doc(user.uid);
            docRef.get().then(function (doc) {
                userData = doc.data();
            });

            //Steps logic
            const steps = document.getElementsByClassName("steps");
            let stepIndex = 0;
            steps[stepIndex].style.display = "flex";
            document.getElementById("back").style.display = "none";
            $scope.nextStep = _ => {
                steps[stepIndex].style.display = "none";
                stepIndex++;
                steps[stepIndex].style.display = "flex";
                if (stepIndex == steps.length - 1) {
                    document.getElementById("next").style.display = "none";
                    document.getElementById("subButton").style.display = "block";
                } else {
                    document.getElementById("back").style.display = "block";
                    document.getElementById("subButton").style.display = "none";
                }
            }

            $scope.lastStep = _ => {
                steps[stepIndex].style.display = "none";
                stepIndex--;
                steps[stepIndex].style.display = "flex";
                if (stepIndex == 0) {
                    document.getElementById("back").style.display = "none";
                    document.getElementById("next").style.display = "block";
                } else {
                    document.getElementById("next").style.display = "block";
                    document.getElementById("subButton").style.display = "none";
                }
            }

            //Creating the event section
            $scope.Submit = _ => {
                // Making the final users that will be added to the attendents list
                let finalAttendees = [{ name: userData.username, userID: null, hasAccepted: true, picture: userData.profileImage }];
                $scope.list.forEach(element => {
                    finalAttendees.push(element);
                });

                for (let i = 0; i < finalAttendees.length; i++) {
                    userData.friends.forEach(friend => {
                        if (finalAttendees[i].name == friend.username) {
                            finalAttendees[i].userID = friend.id;
                            finalAttendees[i].hasAccepted = false;
                            finalAttendees[i].picture = friend.img;
                        };
                    });
                }

                let event = {
                    id: genID(),
                    attendees: finalAttendees,
                    e_Name: $scope.eventName,
                    e_Master: userData.username,
                    e_Description: $scope.eventDescription,
                    e_Location: $scope.eventAddress,
                    e_Start_Time: firebase.firestore.Timestamp.fromDate(new Date($scope.dateS)),
                    e_End_Time: firebase.firestore.Timestamp.fromDate(new Date($scope.dateE))
                }

                const invitationEvent = {
                    eventTitle: event.e_Name,
                    eventMaster: event.e_Master,
                    masterID: user.uid,
                    eventDesc: event.e_Description,
                    eventLocation: event.e_Location,
                    eventId: event.id,
                    eventStart: event.e_Start_Time,
                    eventEnd: event.e_End_Time
                };

                event.attendees.forEach(user => {
                    userData.friends.forEach(friend => {
                        if (user.name == friend.username) {
                            db.collection('Users').doc(friend.id).update({
                                invitations: firebase.firestore.FieldValue.arrayUnion(invitationEvent)
                            });
                        }
                    });
                });



                docRef.update({
                    schedule: firebase.firestore.FieldValue.arrayUnion(event)
                }).then(_ => {
                    window.location.href = '/#!/home';
                })
            };

            $scope.list = [];

            // Adding friends to event section
            $scope.userAdd = _ => {
                $scope.list.push({
                    "name": $scope.addedAttendee,
                    "hasAccepted": true,
                    "userID": null,
                    "picture": "/Images/userIcon2.png"
                });
                $scope.addedAttendee = "";
            }
            // Removeing friends from event
            $scope.remove = index => {
                let newUserList = $scope.list;
                $scope.list = [];
                newUserList.forEach(user => {
                    if (user.name != newUserList[index].name) {
                        $scope.list.push(user);
                    };
                });

            }

            //Loading screen section
            const timeConfig = {
                altInput: true,
                altFormat: "F j, Y h:i K",
                enableTime: true,
                dateFormat: "Z",
            }
            const dateStart = flatpickr("#StartDate", timeConfig);
            const dateEnd = flatpickr("#EndDate", timeConfig);

            isloading(true);
            $interval.cancel(loadingInterval);
        } else if (loadingCount == 5) {
            window.location.href = '/#!/';
        } else {
            loadingCount += 1;
        }
    }, 1000);
});

app.controller('updateEventController', function ($scope, $routeParams, $interval) {
    isloading(false);
    let loadingCount = 0;
    let loadingInterval = $interval(function () {
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
                    event = getEvent(userData.schedule, $routeParams.eventID);
                    $scope.list = [];
                    event.attendees.forEach(attendee => {
                        if (attendee.picture == "") {
                            attendee.picture = "/Images/userIcon2.png"
                        }
                        $scope.list.push(attendee);
                    });
                    $scope.eventName = event.e_Name;
                    $scope.eventDescription = event.e_Description;
                    $scope.eventAddress = event.e_Location;
                    $scope.dateS = firebase.firestore.Timestamp.fromDate(new Date(event.e_Start_Time));
                    $scope.dateE = firebase.firestore.Timestamp.fromDate(new Date(event.e_End_Time));
                    $scope.$apply();

                    //Loading screen section
                    const dateStart = flatpickr("#StartDate", {
                        altInput: true,
                        altFormat: "F j, Y h:i K",
                        enableTime: true,
                        dateFormat: "Z",
                        defaultDate: event.e_Start_Time.toDate()
                    });
                    const dateEnd = flatpickr("#EndDate", {
                        altInput: true,
                        altFormat: "F j, Y h:i K",
                        enableTime: true,
                        dateFormat: "Z",
                        defaultDate: event.e_End_Time.toDate()
                    });
                };

                //Steps logic
                const steps = document.getElementsByClassName("steps");
                let stepIndex = 0;
                steps[stepIndex].style.display = "flex";
                document.getElementById("back").style.display = "none";
                $scope.nextStep = _ => {
                    steps[stepIndex].style.display = "none";
                    stepIndex++;
                    steps[stepIndex].style.display = "flex";
                    if (stepIndex == steps.length - 1) {
                        document.getElementById("next").style.display = "none";
                        document.getElementById("subButton").style.display = "block";
                    } else {
                        document.getElementById("back").style.display = "block";
                        document.getElementById("subButton").style.display = "none";
                    }
                }

                $scope.lastStep = _ => {
                    steps[stepIndex].style.display = "none";
                    stepIndex--;
                    steps[stepIndex].style.display = "flex";
                    if (stepIndex == 0) {
                        document.getElementById("back").style.display = "none";
                        document.getElementById("next").style.display = "block";
                    } else {
                        document.getElementById("next").style.display = "block";
                        document.getElementById("subButton").style.display = "none";
                    }
                }

                $scope.Submit = _ => {
                    const user = firebase.auth().currentUser;
                    const newEventarray = [];
                    const finalAttendees = [];

                    $scope.list.forEach(element => {
                        finalAttendees.push(element);
                    });

                    userData.schedule.forEach(event => {
                        if (event.e_Name == event.e_Name) {
                            let newEvent = {
                                attendees: finalAttendees,
                                e_Name: $scope.eventName,
                                e_Master: masterName,
                                e_Description: $scope.eventDescription,
                                e_Location: $scope.eventAddress,
                                e_Start_Time: firebase.firestore.Timestamp.fromDate(new Date($scope.dateS)),
                                e_End_Time: firebase.firestore.Timestamp.fromDate(new Date($scope.dateE))
                            }
                            event = newEvent;
                            newEventarray.push(newEvent);
                        } else {
                            newEventarray.push(event);
                        }
                    });

                    var docRef = db.collection("Users").doc(user.uid);
                    console.log(newEventarray);
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


                $interval.cancel(loadingInterval);
            } else {
                window.location.href = '/#!/';
            }
            isloading(true);
            $interval.cancel(loadingInterval);
        } else if (loadingCount == 5) {
            window.location.href = '/#!/';
        } else {
            loadingCount += 1;
        }
    }, 1000);
});

app.controller('friendsController', function ($scope, $interval) {
    isloading(false);
    let loadingCount = 0;
    let loadingInterval = $interval(function () {
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

            isloading(true);
            $interval.cancel(loadingInterval);
        } else if (loadingCount == 5) {
            window.location.href = '/#!/';
        } else {
            loadingCount += 1;
        }
    }, 1000);
});

app.controller('friendScheduleController', function ($scope, $routeParams, $interval) {
    isloading(false);
    let loadingCount = 0;
    let loadingInterval = $interval(function () {
        if (firebase.auth().currentUser != null) {
            const userRef = db.collection('Users').doc($routeParams.id);
            let schedule = [];
            userRef.get().then(function (doc) {
                $scope.loadSchedule(doc.data());
            });

            $scope.loadSchedule = userData => {
                $scope.user = userData;
                schedule = userData.schedule;
                $scope.events = schedule;
                $scope.$apply();
            };

            $scope.viewEvent = index => {
                window.location.href = `/#!/viewEvent/${$routeParams.id}/${schedule[index].id}`;
            }

            isloading(true);
            $interval.cancel(loadingInterval);
        } else if (loadingCount == 5) {
            window.location.href = '/#!/';
        } else {
            loadingCount += 1;
        }
    }, 1000);
});

app.controller('addFriendController', function ($scope, $interval) {
    isloading(false);
    let loadingCount = 0;
    let loadingInterval = $interval(function () {
        if (firebase.auth().currentUser != null) {
            let addSection = document.getElementsByClassName("userInfoSection")
            let documents = null;
            let userFriends = [];
            let userData = [];
            let friend = null;
            let currUser = [];
            const user = firebase.auth().currentUser;
            let userRef = db.collection('Users').doc(user.uid);
            userRef.get().then(function (res) {
                userFriends = res.data().friends;
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
                isloading(true);
                $interval.cancel(loadingInterval);
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
                let alreadyFriends = false;

                currUser[1].pendingFriends.forEach(penFriend => {
                    if (penFriend.username == friend.username) {
                        alreadyPending = true;
                    }
                });
                userFriends.forEach(doc => {
                    if (doc.username == friend.username) {
                        alreadyFriends = true;
                    }
                });


                if (alreadyPending == false && alreadyFriends == false) {
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
                    notie.alert({ type: 1, text: 'Friend request sent!' });
                } else if (alreadyFriends == true) {
                    notie.alert({ type: 3, text: 'This user is already your friend' });
                } else {
                    notie.alert({ type: 3, text: 'Friend request pending' });
                }
                $scope.reset();

            }

            $scope.reset = _ => {
                addSection[0].style.display = "none";
                $scope.searchTxt = "";
            }

        } else if (loadingCount == 5) {
            window.location.href = '/#!/';
        } else {
            loadingCount += 1;
        }
    }, 1000);
});

function toTimestamp(year, month, day, hour, minute, second) {
    var datum = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
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

const genID = _ => {
    let rand = Math.floor((Math.random() * 8999) + 1001);
    let digits = new Date().getTime();
    const id = digits.toString() + rand.toString();
    return id;
}

const getEvent = (allEvents, eventId) => {
    let res = "";
    allEvents.forEach(curEvent => {
        if (curEvent.id == eventId) {
            res = curEvent;
        };
    });
    return res;
}

const isloading = isloading => {
    if (isloading) {
        loadingSection.style.display = "none";
        appSection.style.display = "block";
    } else {
        loadingSection.style.display = "flex";
        appSection.style.display = "none";
    }
}

const setImage = _ => {
    var preview = document.getElementById('singUpImage');
    var file = document.getElementById('filePicker').files[0];
    var reader = new FileReader();

    reader.addEventListener("load", function () {
        preview.src = reader.result;
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }
}

menuIcon.addEventListener('click', menuFunction);
