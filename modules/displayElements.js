/*jshint esversion: 6 */

const loader = document.getElementById('loader');
const dataWrap = document.getElementsByClassName('data-wrap')[0];
const errorWrap = document.getElementById('error');

function displayLoader() {
    loader.style.display = "block";
    dataWrap.classList.add('hidden');
}

function hideLoader() {
    loader.style.display = "none";
    dataWrap.classList.remove('hidden');
}

function showError(errorMessage) {
    dataWrap.classList.add('hidden');
    errorWrap.classList.remove('hidden');
    errorWrap.innerText = errorMessage;
}

function hideError() {
    errorWrap.innerText = '';
    errorWrap.classList.add('hidden');
    dataWrap.classList.remove('hidden');
}

function removeActive() {
    const forecastItems = document.getElementsByClassName('active');
    for (const item of forecastItems) {
        item.classList.remove('active');
    }
}

function showDetailsTab() {
    const details = document.getElementsByClassName('details')[0];
    const showDetailsElement = document.getElementsByClassName('show-details')[0];
    showDetailsElement.innerHTML =
        `
                <p>hide details</p>
                <a href=# id="button-show" class="button hidden"><img src="./images/show.png"></a>
                <a href=# id="button-hide" class="button"><img src="./images/hide.png"></a>
         `;
    const buttons = document.getElementsByClassName('button');
    const showButton = document.getElementById('button-show');
    const hideButton = document.getElementById('button-hide');
    const detailsText = document.querySelector('.show-details p');

    let showDetails = true;

    for (const button of buttons) {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            showDetails = !showDetails;
            if (showDetails === true) {
                details.classList.remove('hidden');
                hideButton.classList.remove('hidden');
                showButton.classList.add('hidden');
                detailsText.classList.remove('hidden');
                detailsText.innerText = "hide details";
            } else {
                details.classList.add('hidden');
                hideButton.classList.add('hidden');
                showButton.classList.remove('hidden');
                detailsText.classList.remove('hidden');
                detailsText.innerText = "show details";
            }
        });
    }
}

export {displayLoader, hideLoader, showError, hideError, removeActive, showDetailsTab}; 