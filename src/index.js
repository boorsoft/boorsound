const electron = require('electron')
const remote = electron.remote
const fs = require('fs')
const path = require('path')
const mm = require('musicmetadata')

const audio = new Audio();
audio.src = path.join(__dirname, '../assets/L’Indécis-Playtime.mp3')

const quitButton = document.querySelector('#quitButton')
const minimizeButton = document.querySelector('#minimizeButton')
const coverContainer = document.querySelector('.cover-container')
const trackTitle = document.querySelector('#trackTitle')
const artist = document.querySelector('#artist')

const prevButton = document.querySelector('#prevButton')
const playOrPauseButton = document.querySelector('#playOrPauseButton')
const nextButton = document.querySelector('#nextButton')

const fillbar = document.querySelector('.fillbar')
const seekbar = document.querySelector('.seekbar')
var dragging = false;

// create stream to read an mp3 file
var stream = fs.createReadStream(path.join(__dirname, '../assets/L’Indécis-Playtime.mp3')) 
// get mp3 data, such as track title, artist, cover image etc.
mm(stream, (err, data) => {
    if (err) throw err;
    stream.close()
    console.log(data)
    console.log(data['picture'])

    // get the cover image buffer data
    var coverBuffer = data['picture'][0].data
    var blob = new Blob([coverBuffer], {type: "image/jpeg"}) // Make it BLOB
    var urlCreator = window.URL || window.webkitURL; // initialize an url creator
    var coverUrl = urlCreator.createObjectURL( blob ); // create an url to a BLOB object

    // set the HTML elements' values to the values we read from an mp3 file
    artist.innerHTML = data['artist']
    trackTitle.innerHTML = data['title']
    coverContainer.style.backgroundImage = `url(${coverUrl})`
})

// Audio controls
function playOrPause() {
    if (audio.paused) {
        playOrPauseButton.firstChild.className = 'fa fa-pause'
        audio.play();
    } else {
        playOrPauseButton.firstChild.className = 'fa fa-play';
        audio.pause();
    }
}

playOrPauseButton.addEventListener('click', playOrPause)

// Update fillbar 
audio.addEventListener('timeupdate', () => {
    var position = audio.currentTime / audio.duration;

    fillbar.style.width = position * 100 + '%'

    if (audio.ended) {
        playOrPauseButton.firstChild.className = 'fa fa-play'
        audio.pause()
    }
})

seekbar.addEventListener('mousedown', (e) => {
    var clickPos = e.clientX - seekbar.style.width
    audio.currentTime = (clickPos / seekbar.offsetWidth) * audio.duration
    dragging = true;
}, false)

seekbar.addEventListener('mousemove', (e) => {
    if (dragging) {
        var clickPos = e.clientX - seekbar.style.width;
        audio.currentTime = (clickPos / seekbar.offsetWidth) * audio.duration;
    }
});

seekbar.addEventListener('mouseup', (e) => {
    dragging = false;
})

var win = remote.getCurrentWindow();

minimizeButton.addEventListener('click', () => {
    win.minimize()
})

// Close app on click
quitButton.addEventListener('click', () => {
    win.close();
})