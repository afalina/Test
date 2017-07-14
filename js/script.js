var baseUrl = 'http://smktesting.herokuapp.com';
var allItems = [];

const letWatchButton = document.querySelector('#letWatch');
const loginButton = document.querySelector('#login');
const registrationButton = document.querySelector('#registration');
const logoutButton = document.querySelector('#logout');
logoutButton.addEventListener('click', function(event) {
    logout();
});


if (ifLoggedIn()) {
    document.querySelector('#hello').innerHTML += ', ' + getUsername();
    loginButton.style.display = 'none';
    registrationButton.style.display = 'none';
    logoutButton.style.display = 'inline-block';
} else {
    logoutButton.style.display = 'none';
    loginButton.style.display = 'inline-block';
    registrationButton.style.display = 'inline-block';
}

function getAllItems() {
    function getProducts() {
        return axios.get(baseUrl + '/api/products/')
            .catch(function (error) {
                console.log(error);
            });
    }

    return getProducts().then(function (response) {
        allItems = response.data;
    });
}

function showAllItems() {
    return getAllItems().then(function () {
        for (var i = 0; i < allItems.length; i++) {
            document.querySelector('#products').innerHTML +=
                '<div class="card">' +
                    '<h4 class="card-title">' + allItems[i].title + '</h4>' +
                    '<div class="card-img-top">' +
                        '<img src="' + baseUrl + '/static/' + allItems[i].img + '">' +
                    '</div>' + 
                    '<div class="card-block">' +
                        '<div class="card-text">' +
                            '<a href="product.html?id=' + allItems[i].id + '" class="btn btn-primary">Show product</a>'
                        '</div>' +
                    '</div>' +
                '</div>'
        }
    });
}

function getPoductById(id) {
    return getAllItems().then(function () {
        let product = allItems.filter(function(product) {return product.id == id})[0];
        document.querySelector('#product').innerHTML +=
            '<section>' +
              '<div class="container py-3">' +
                '<div class="card">' +
                  '<div class="row ">' +
                    '<div class="col-md-4">' +
                      '<img src="' + baseUrl + '/static/' + product.img + '" class="w-100">' +
                    '</div>' +
                      '<div class="col-md-8 px-3">' +
                        '<div class="card-block px-3">' +
                          '<h2 class="card-title">' + product.title + '</h2>' +
                          '<p class="card-text">' + product.text + '</p>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</section>' 
    });
}

function registration(username, password) {
    let user_token
    function registrationUser() {
        return axios.post(baseUrl + '/api/register/', {
            username: username,
            password: password
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    return registrationUser().then(function (response) {
        if (response.data.success) {
            user_token = response.data.token;
            window.localStorage.setItem('username', username);
            window.localStorage.setItem('user_token', user_token);
            window.location.replace('index.html');
            return {
                username: username,
                user_token: user_token
            }
        } else {
            document.querySelector('#loginErrors').innerHTML += 
            '<div class="alert alert-danger">' +
                '<strong>Ooooops!</strong> Unexpected error!' +
            '</div>';
            console.log('Ooooops!');
        }
    });
}

function login(username, password) {
    let user_token
    function getUserToken() {
        return axios.post(baseUrl + '/api/login/', 
            {
                username: username,
                password: password
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    return getUserToken().then(function (response) {
        if (response.data.success) {
            user_token = response.data.token;
            window.localStorage.setItem('username', username);
            window.localStorage.setItem('user_token', user_token);
            window.location.replace('index.html');
            return {
                username: username,
                user_token: user_token
            }
        } else {
            document.querySelector('#loginErrors').innerHTML += 
            '<div class="alert alert-danger">' +
                '<strong>Error!</strong>  We don\'t know your login or password.' +
            '</div>';
            console.log('Error! We don\'t know your login or password');
        }
    });
}

function ifLoggedIn () {
    return localStorage.getItem('user_token') !== null;
}

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('user_token');
}

function getUsername() {
    return localStorage.getItem('username');
}

function getPostIdByUrl(url) {
    return new URL(url).searchParams.get("id");
}

function getProductCommentsById(id) {
    let comments

    function getComments() {
        return axios.get(baseUrl + '/api/reviews/' + id)
            .catch(function (error) {
                console.log(error);
            });
    }

    function setRateYo(i, rate) {
        $(function() {
            $('.rateyo-'+i+'-'+rate).rateYo({
                rating: rate,
                numStars: 5,
                starWidth: '15px',
                readOnly: true
            }).on('rateyo.init', function(e, data) {
                document.querySelector('#comments').innerHTML +=
                    comments[i].text + '<br>at ' +
                    new Date(comments[i].created_at).toLocaleDateString() + ' ' +
                    new Date(comments[i].created_at).toLocaleTimeString() +
                    '<hr>';
            });
        });
    }

    return getComments().then(function (response) {
        comments = response.data;
        for (let i = 0; i < comments.length; i++) {
            document.querySelector('#comments').innerHTML += 
                        '<hr>' +
                        '<b>' + comments[i].created_by.username + '</b> wrote <br> at ' +
                        new Date(comments[i].created_at).toLocaleDateString() + ' ' +
                        new Date(comments[i].created_at).toLocaleTimeString() + '<br><br>' +
                        comments[i].text +'<br><br>' +
                        '<div class="rateyo rateyo-' + i + '-' + comments[i].rate + '"></rateyo>' +
                        setRateYo(i, comments[i].rate) + '<br>';
        }
    });
}

function postComment(id, rate, text) {

    function sendComment() {
        return axios.post(baseUrl + '/api/reviews/' + id, 
        {
            rate: rate,
            text: text
        },{
            headers: {
                Authorization: 'Token ' + window.localStorage.getItem('user_token'),
            } 
        })
        .catch(function (error) {
            document.querySelector('#commentForNotLogged').innerHTML += 
            '<div class="alert alert-danger">' +
                '<strong>Error!</strong> Something bad happened. Relogin please.' +
            '</div>';
            //console.log('Error! Relogin');
        });
    }

    return sendComment().then(function (response) {
        if (response.data.success) {
            location.reload();
        } else {
            document.querySelector('##commentForNotLogged').innerHTML += 
            '<div class="alert alert-danger">' +
                '<strong>Error!</strong> Something bad happened. Relogin please.' +
            '</div>';
            console.log('Error! Relogin');
        }
    });
}


