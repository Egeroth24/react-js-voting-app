let showErrors = (inputEl, errorEl) => {
    inputEl.classList.add('invalid');
    errorEl.classList.add('visible');
}

let hideErrors = (inputEl, errorEl) => {
    inputEl.classList.remove('invalid');
    errorEl.classList.remove('visible');
}

let preloader = (action, el) => {
    let preloader = document.getElementById('preloader' + el);
    let xMarkContainer = document.getElementById('xMarkContainer' + el);
    let xMark1 = document.getElementById('xMark1' + el);
    let xMark2 = document.getElementById('xMark2' + el);
    let checkmark = document.getElementById('checkmark' + el);
    let error = document.getElementById('error' + el);

    xMarkContainer.style.visibility = 'hidden';
    xMark1.classList.remove('draw');
    xMark2.classList.remove('draw');
    checkmark.style.visibility = 'hidden';
    checkmark.classList.remove('draw');

    function start() {
        preloader.classList.add('active');
        error.classList.remove('visible');
    }

    function success() {
        preloader.classList.remove('active');
        checkmark.style.visibility = 'visible';
        checkmark.classList.add('draw');
    }

    function fail() {
        preloader.classList.remove('active');
        xMarkContainer.style.visibility = 'visible';
        xMark1.classList.add('draw');
        xMark2.classList.add('draw');
    }

    switch (action) {
        case 'start':
            start();
            break;
        case 'success':
            success();
            break;
        case 'fail':
            fail();
            break;
    }
    
}

export { showErrors, hideErrors, preloader };