const { lookupService } = require('dns')
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
const remote = electron.remote
const fs = require('fs')
const mm = require('musicmetadata')
const Store = require('./store')

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
const repeatButtonColor = 'rgba(38, 41, 41, 0.45)'

const fillbar = document.querySelector('.fillbar')
const seekbar = document.querySelector('.seekbar')
const volumeButton = document.querySelector('#volumeButton')
const volumeContainer = document.querySelector('.volume-container')
const volumeFillbar = document.querySelector('.volume-fillbar')
const volumeControl = document.querySelector('.volume-control')

var dragging = false;
var volumeOpen = false;

const audio = new Audio();

const store = new Store()

init();

function init(track = remote.process.argv[1]) {
    repeat = Boolean(store.get('repeat')) // read from file

    // Change repeat button styling
    if (repeat) repeatButton.style.backgroundColor = repeatButtonColor;
    else repeatButton.style.backgroundColor = ''
    
    // set the audio file
    var file = track
    audio.src = file
    audio.autoplay = true;
    playOrPauseButton.firstChild.className = 'fa fa-pause'

    if (file != '.') {
        // create stream to read an mp3 file
        var stream = fs.createReadStream(file)
        // get mp3 data, such as track title, artist, cover image etc.
        mm(stream, (err, data) => {
            if (err) throw err;
            stream.close()

            // get the cover image buffer data if exists
            if (data['picture'].length != 0) {
                var coverBuffer = data['picture'][0].data
                var blob = new Blob([coverBuffer], {type: "image/jpeg"}) // Make it BLOB
                var urlCreator = window.URL || window.webkitURL; // initialize an url creator
                var coverUrl = urlCreator.createObjectURL( blob ); // create an url to a BLOB object
                coverContainer.style.backgroundImage = `url(${coverUrl})`
                bg.style.backgroundImage = `url(${coverUrl})`
            } else {
                bg.style.backgroundColor = '#25292c'
                coverContainer.style.backgroundImage = 'url("../assets/icons/boorsound-logo-no-circle.png")' // else set boorsound logo as the cover image
            }

            // set the HTML elements' values to the values we read from an mp3 file
            artist.innerHTML = data['artist']
            trackTitle.innerHTML = data['title']
        })
    }
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
        repeatButton.style.backgroundColor = repeatButtonColor
        repeat = true;
    }

    store.set('repeat', repeat) // Save value to the store

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

// Event listeners
playOrPauseButton.addEventListener('click', playOrPause)
repeatButton.addEventListener('click', repeatAudio)

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') playOrPause()
})

// Update fillbar 
audio.addEventListener('timeupdate', () => {
    var position = audio.currentTime / audio.duration;
    convertTime(Math.round(audio.currentTime))

    fillbar.style.width = position * 100 + '%'

    if (audio.ended) {
        if (repeat) {
            audio.play()
        } else {
            playOrPauseButton.firstChild.className = 'fa fa-play'
            audio.pause()
        }
    } 
})

// Change position of seekbar && current time of audio
seekbar.addEventListener('mousedown', (e) => {
    let clickPos = e.clientX - seekbar.style.width
    audio.currentTime = (clickPos / seekbar.offsetWidth) * audio.duration
    dragging = true;
}, false)

document.addEventListener('mousemove', (e) => {
    if (dragging) {
        let clickPos = e.clientX - seekbar.style.width
        audio.currentTime = (clickPos / seekbar.offsetWidth) * audio.duration;
    }
});

document.addEventListener('mouseup', () => {
    dragging = false;
})

// Open volume container on click
volumeButton.addEventListener('click', () => {
    if (!volumeOpen) {
        volumeContainer.style.display = 'block'
        volumeOpen = true;
    } else {
        volumeContainer.style.display = 'none'
        volumeOpen = false;
    }
})

volumeControl.addEventListener('mousedown', (e) => {
    console.log('mousedown')
    console.log(clickPos)
    console.log(audio.volume)
})

var win = remote.getCurrentWindow();

ipcRenderer.on('second-instance', (e, file) => {
    console.log('File', file)
    init(file) // Swipe files if second instance of app is opened
})

minimizeButton.addEventListener('click', () => {
    win.minimize()
})

// Close app on click
quitButton.addEventListener('click', () => {
    win.close();
})
