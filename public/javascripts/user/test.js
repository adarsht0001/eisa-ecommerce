var nameError = document.getElementById('name-error')
var emailError = document.getElementById('email-error')
var mobileError = document.getElementById('mobile-error')
var passerror = document.getElementById('pass-error')
var passerror2 = document.getElementById('pass2-error')

const form = document.getElementById('form');


function validateName() {
    var name = document.getElementById('name').value;
    if (name.length == 0) {
        nameError.innerHTML = 'Name required';
        return false;
    }
    else if (!name.match(/[A-Za-z]/)) {
        nameError.innerHTML = 'Write Full Name';
        return false;
    }
    nameError.innerHTMl = ''
    return true;
}
function validateMobile() {
    var mobile = document.getElementById('phone').value;
    if (mobile.length == 0) {
        mobileError.innerHTML = 'Mobile no required'
        return false;
    }
    if (!mobile.match(/^[0-9]{10}$/)) {
        mobileError.innerHTML = 'Mobile no Invalid'
        return false;
    }
    if (mobile.length !== 10) {
        mobileError.innerHTML = 'Mobile no should be 10 digits'
        return false;
    }
    mobileError.innerHTML = ''
    return true;
}
function validateEmail() {
    var email = document.getElementById('email').value;
    if (email.length == 0) {
        emailError.innerHTML = 'Email required'
        return false;
    }
    if (!email.match(/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)) {
        emailError.innerHTML = 'Email Invalid'
        return false;
    }
    emailError.innerHTML = ''
    return true;
}
function passwordvalidate() {
    var pass = document.getElementById('pass').value
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
    var pass = document.getElementById('pass').value
    var repass = document.getElementById('repass').value
    if (repass == '') {
        passerror2.innerHTML = 're-password not entered'
        return false
    } else if (pass != repass) {
        passerror2.innerHTML = "Password doesn't match"
        return false
    } else {
        passerror2.innerHTML = ""
        return true
    }
}

function valideform() {
    validateEmail();
    validateMobile();
    validateName();
    passwordvalidate();
    if (validateEmail() && validateMobile() && validateName() && passwordvalidate() && validateRepass()) {
        return true;
    }
    else {
        return false;
    }
}