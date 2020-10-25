const electron = require('electron')
const remote = electron.remote;

const quitButton = document.querySelector('.app-quit-button')

quitButton.addEventListener('click', () => {
    var window = remote.getCurrentWindow();
    window.close();
})