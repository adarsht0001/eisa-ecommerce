$('#changepassword').submit((e) => {
    e.preventDefault()
    if (passwordvalidate() && newpasswordvalidate() && validateRepass()) {
        $.ajax({
            url: '/changePassword',
            method: 'post',
            data: $("#changepassword").serialize(),
            success: ((response) => {
                if (response.status) {
                    Swal.fire({
                        icon: "success",
                        title: "Congrats!",
                        text: "Your Password Has Been Changed",
                    }).then(() => { location.reload() })
                } else {
                    Swal.fire({
                        icon: "error",
                        title: response.message,
                        text: "Something went wrong!",
                    });
                }
            })
        })
    } else {
        Swal.fire({
            icon: "error",
            title: "Please Input Valid Credentials",
        });
    }

})

function passwordvalidate() {
    var pass = document.getElementById('currentpassword').value
    var passerror = document.getElementById('pass-error')
    var regexWhiteSpace = /^\S*$/
    var regexUpperCase = /^(?=.*[A-Z]).*$/
    var regexLowerCase = /^(?=.*[a-z]).*$/
    var regexNumber = /^(?=.*[0-9]).*$/;
    var regexSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
    var regexLength = /^.{7,16}$/;
    if (pass == "") {
        passerror.innerHTML = 'Password not entered'
        return false;
    } else if (!regexWhiteSpace.test(pass)) {
        passerror.innerHTML = "Password must not contain Whitespaces."
        return false;
    } else if (!regexUpperCase.test(pass)) {
        passerror.innerHTML = 'Password must have at least one Uppercase Character.'
        return false;
    } else if (!regexLowerCase.test(pass)) {
        passerror.innerHTML = "Password must have at least one Lowercase Character."
        return false;
    } else if (!regexNumber.test(pass)) {
        passerror.innerHTML = 'Password must contain at least one Digit.'
        return false;
    } else if (!regexSymbol.test(pass)) {
        passerror.innerHTML = 'Password must contain at least one Special Symbol.'
        return false;
    } else if (!regexLength.test(pass)) {
        passerror.innerHTML = 'Password must be 7-16 Characters Long.'
        return false;
    } else {
        passerror.innerHTML = ''
        return true
    }
}

function newpasswordvalidate() {
    var pass = document.getElementById('new-pass').value
    var passerror = document.getElementById('pass-error1')
    var regexWhiteSpace = /^\S*$/
    var regexUpperCase = /^(?=.*[A-Z]).*$/
    var regexLowerCase = /^(?=.*[a-z]).*$/
    var regexNumber = /^(?=.*[0-9]).*$/;
    var regexSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
    var regexLength = /^.{7,16}$/;
    if (pass == "") {
        passerror.innerHTML = 'Password not entered'
        return false;
    } else if (!regexWhiteSpace.test(pass)) {
        passerror.innerHTML = "Password must not contain Whitespaces."
        return false;
    } else if (!regexUpperCase.test(pass)) {
        passerror.innerHTML = 'Password must have at least one Uppercase Character.'
        return false;
    } else if (!regexLowerCase.test(pass)) {
        passerror.innerHTML = "Password must have at least one Lowercase Character."
        return false;
    } else if (!regexNumber.test(pass)) {
        passerror.innerHTML = 'Password must contain at least one Digit.'
        return false;
    } else if (!regexSymbol.test(pass)) {
        passerror.innerHTML = 'Password must contain at least one Special Symbol.'
        return false;
    } else if (!regexLength.test(pass)) {
        passerror.innerHTML = 'Password must be 7-16 Characters Long.'
        return false;
    } else {
        passerror.innerHTML = ''
        return true
    }
}

function validateRepass() {
    let pass = document.getElementById('new-pass').value
    let repass = document.getElementById('repass').value
    let passerror = document.getElementById('pass-error2')
    if (repass == '') {
        passerror.innerHTML = 're-password not entered'
        return false
    } else if (pass != repass) {
        passerror.innerHTML = "Password doesn't match"
        return false
    } else {
        passerror.innerHTML = ""
        return true
    }
}