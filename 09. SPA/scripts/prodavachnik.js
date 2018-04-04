function startApp() {

    const BASE_URL = 'https://baas.kinvey.com/'
    const APP_KEY = 'kid_Skvjc8ZjG'
    const APP_SECRET = 'e92585201d104d1db3b70f9f210513fc'
    const AUTH_HEADERS = {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)}

    $('#linkHome').click(showHome)
    $('#linkLogin').click(showLogin)
    $('#linkRegister').click(showRegister)
    $('#linkListAds').click(showListAll)
    $('#linkCreateAd').click(showCreateAd)
    $('#linkLogout').click(showLogout)
    $('#buttonRegisterUser').click(register)
    $('#buttonLoginUser').click(login)
    $('#buttonCreateAd').click(createAd)

    showHome()

    function showHome() {
        $('section').hide()
        $('#menu a').hide()
        $('#linkHome').show()
        if (sessionStorage.getItem('authToken') === null) {
            $('#linkLogin').show()
            $('#linkRegister').show()
        }
        else {
            $('#linkListAds').show()
            $('#linkCreateAd').show()
            $('#linkLogout').show()
        }
        $('#viewHome').show()

    }

    function showLogin() {
        $('section').hide()
        $('#viewLogin').show()
    }

    function showRegister() {
        $('section').hide()
        $('#viewRegister').show()
    }

    function showListAll() {
        $('section').hide()
        let titles = $('#viewAds').find('tr').eq(0)
        $('#viewAds').show().find('table').empty().append(titles)
        $.ajax({
            url: BASE_URL + 'appdata/' + APP_KEY + '/ads',
            headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')}
        }).then((res) => {
            res.forEach(ad => {
                let tr = $('<tr>')
                tr
                    .append($('<td>').text(ad.title))
                    .append($('<td>').text(ad.publisher))
                    .append($('<td>').text(ad.description))
                    .append($('<td>').text(ad.price))
                    .append($('<td>').text(ad.dateOfPublishing))
                if (ad.publisher === sessionStorage.getItem('username')) {
                    tr.append($('<td>')
                        .append($('<a href="#">').text('[Delete]').click(
                            () => {
                                deleteAd(ad)
                            }
                        ))
                        .append($('<a href="#">').text('[Edit]').click(
                            () => {
                                editAd(ad)
                            }
                        ))
                    )
                }
                $('#viewAds table').append(tr)
            })
        })
    }

    function deleteAd(ad) {
        $.ajax({
            method: 'DELETE',
            url: BASE_URL + 'appdata/' + APP_KEY + '/ads/' + ad._id,
            headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')}
        }).then(() => {
            showListAll()
        })
    }

    function editAd(ad) {
        $('section').hide()
        $('#viewEditAd').find('input[name=id]').val(ad._id)
        $('#viewEditAd').find('input[name=publisher]').val(ad.publisher)
        $('#viewEditAd').find('input[name=title]').val(ad.title)
        $('#viewEditAd').find('textarea[name=description]').val(ad.description)
        $('#viewEditAd').find('input[name=datePublished]').val(ad.dateOfPublishing)
        $('#viewEditAd').find('input[name=price]').val(ad.price)
        $('#viewEditAd').show()


        $('#buttonEditAd').click(editAdConfirm)

        function editAdConfirm() {
            let editedAd = {
                title: $('#viewEditAd').find('input[name=title]').val(),
                description: $('#viewEditAd').find('textarea[name=description]').val(),
                dateOfPublishing: $('#viewEditAd').find('input[name=datePublished]').val(),
                price: $('#viewEditAd').find('input[name=price]').val(),
                publisher: sessionStorage.getItem('username'),
            }

            $.ajax({
                method: 'PUT',
                url: BASE_URL + 'appdata/' + APP_KEY + '/ads/' + ad._id,
                headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')},
                data: editedAd
            }).then(() => {
                showListAll()
            })
        }

    }

    function showCreateAd() {
        $('section').hide()
        $('#viewCreateAd').show()
    }

    function createAd() {
        let newAd = {
            title: $('#viewCreateAd').find('input[name=title]').val(),
            description: $('#viewCreateAd').find('textarea[name=description]').val(),
            dateOfPublishing: $('#viewCreateAd').find('input[name=datePublished]').val(),
            price: $('#viewCreateAd').find('input[name=price]').val(),
            publisher: sessionStorage.getItem('username'),
        }

        $.ajax({
            method: 'POST',
            url: BASE_URL + 'appdata/' + APP_KEY + '/ads',
            data: newAd,
            headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')}
        }).then(showListAll)
            .catch(handleAjaxError)

    }

    function showLogout() {
        sessionStorage.clear()
        showHome()
    }

    function register() {
        let username = $('#formRegister').find('input[name=username]').val()
        let password = $('#formRegister').find('input[name=passwd]').val()
        $.ajax({
            method: 'POST',
            url: BASE_URL + 'user/' + APP_KEY + '/',
            headers: AUTH_HEADERS,
            data: {username, password}
        }).then(signInUser)
            .catch(handleAjaxError)
    }

    function login() {
        let username = $('#formLogin').find('input[name=username]').val()
        let password = $('#formLogin').find('input[name=passwd]').val()
        $.ajax({
            method: 'POST',
            url: BASE_URL + 'user/' + APP_KEY + '/login',
            headers: AUTH_HEADERS,
            data: {username, password}
        }).then(signInUser)
            .catch(handleAjaxError)
    }

    function signInUser(res) {
        sessionStorage.setItem('username', res.username)
        sessionStorage.setItem('authToken', res._kmd.authtoken)
        sessionStorage.setItem('userId', res._id)
        showHome()
    }


    function handleAjaxError(err) {
        console.log(err);
    }
}