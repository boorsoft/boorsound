const electron = require('electron')
const remote = electron.remote
const fs = require('fs')
const mm = require('musicmetadata')

const quitButton = document.querySelector('#quitButton')
const minimizeButton = document.querySelector('#minimizeButton')
const coverContainer = document.querySelector('.cover-container')
const trackTitle = document.querySelector('#trackTitle')
const artist = document.querySelector('#artist')
const bg = document.querySelector('.bg')

const trackCurrentTime = document.querySelector('#trackCurrentTime')
const trackDuration = document.querySelector('#trackDuration')

const prevButton = document.querySelector('#prevButton')
const playOrPauseButton = document.querySelector('#playOrPauseButton')
const nextButton = document.querySelector('#nextButton')
const repeatButton = document.querySelector('#repeatButton')

const fillbar = document.querySelector('.fillbar')
const seekbar = document.querySelector('.seekbar')
var dragging = false;
var repeat = false;

const audio = new Audio();

var file = remote.process.argv[1]
audio.src = file
audio.autoplay = true;

if (file != '.') {
    // create stream to read an mp3 file
    var stream = fs.createReadStream(file)
    // get mp3 data, such as track title, artist, cover image etc.
    mm(stream, (err, data) => {
        if (err) throw err;
        stream.close()
        console.log(data)
        console.log(data['picture'])

        // get the cover image buffer data if exists
        if (data['picture'].length != 0) {
            var coverBuffer = data['picture'][0].data
            var blob = new Blob([coverBuffer], {type: "image/jpeg"}) // Make it BLOB
            var urlCreator = window.URL || window.webkitURL; // initialize an url creator
            var coverUrl = urlCreator.createObjectURL( blob ); // create an url to a BLOB object
            coverContainer.style.backgroundImage = `url(${coverUrl})`
            bg.style.backgroundImage = `url(${coverUrl})`
        } else {
            coverContainer.style.backgroundImage = 'url("../assets/icons/boorsound-logo-no-circle.png")' // else set boorsound logo as the cover image
        }

        // set the HTML elements' values to the values we read from an mp3 file
        artist.innerHTML = data['artist']
        trackTitle.innerHTML = data['title']
    })
}

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

function repeatAudio() {
    if (repeat) {
        repeatButton.style.backgroundColor = ''
        repeat = false;
    } else {
        repeatButton.style.backgroundColor = '#262929' 
        repeat = true;
    }
}

// Convert time to 2 digit format
function convertTime(seconds) {
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;

    min = (min < 10) ? "0" + min : min;
    sec = (sec < 10) ? "0" + sec : sec;
    trackCurrentTime.textContent = min + ":" + sec;
    duration(Math.round(audio.duration));
}

// Create 2 digit format instead of 1
function duration(seconds) {
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;

    min = (min < 10) ? "0" + min : min;
    sec = (sec < 10) ? "0" + sec : sec;
    trackDuration.textContent = min + ":" + sec;
}

// Evenet listeners
playOrPauseButton.addEventListener('click', playOrPause)
repeatButton.addEventListener('click', repeatAudio)

// Update fillbar 
audio.addEventListener('timeupdate', () => {
    var position = audio.currentTime / audio.duration;
    convertTime(Math.round(audio.currentTime))

    fillbar.style.width = position * 100 + '%'

    if (audio.ended) {
        if (!repeat) {
            playOrPauseButton.firstChild.className = 'fa fa-play'
            audio.pause()
        } else {
            audio.play()
        }
    } 
})

seekbar.addEventListener('mousedown', (e) => {
    var clickPos = e.clientX - seekbar.style.width
    audio.currentTime = (clickPos / seekbar.offsetWidth) * audio.duration
    dragging = true;
}, false)

document.addEventListener('mousemove', (e) => {
    if (dragging) {
        var clickPos = e.clientX - seekbar.style.width;
        audio.currentTime = (clickPos / seekbar.offsetWidth) * audio.duration;
    }
});

document.addEventListener('mouseup', (e) => {
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