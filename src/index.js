const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
const remote = electron.remote
const fs = require('fs')
const mm = require('musicmetadata')
const Store = require('./store')

const header = document.querySelector('.header')
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
const volumeSlider = document.querySelector('.volume-slider')

const openPlaystlistButton = document.querySelector('#openPlaylistButton')
const closePlaylistButton = document.querySelector("#closePlaylistButton")
const playlistContainer = document.querySelector('.playlist-container')
const playlistInner = document.querySelector('#playlistInner')
const openFolderButton = document.querySelector('#openFolderButton')

var dragging = false;
var volumeOpen = false;

const audio = new Audio();

const store = new Store()

var folders = []; // Remember the folders added by user

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
            if (err) {
            } 
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
                bg.style.backgroundImage = 'none'
                bg.style.backgroundColor = '#25292c'
                coverContainer.style.backgroundImage = 'url("../assets/icons/boorsound-logo-no-circle.png")' // else set boorsound logo as the cover image
            }
            
            // set the HTML elements' values to the values we read from an mp3 file
            if (data['artist'].length != 0) artist.innerHTML = data['artist']
            else artist.innerHTML = 'Unknown'
            if (data['title'].length != 0) trackTitle.innerHTML = data['title']
            else trackTitle.innerHTML = 'No Title'
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

function getFolderIndex() {
    for (let i = 0; i < playlistInner.children.length; i++) {
        playlistInner.children[i].onclick = () => {
            console.log(folders[i])
            playlistInner.innerHTML = ''
            
            folders[i].forEach((el) => {
                let track = document.createElement('div')
                track.setAttribute('class', 'track-container')

                let titleInfo = document.createElement('div')
                titleInfo.setAttribute('class', 'title-info')

                let title = document.createElement('div')
                title.setAttribute('class', 'title')
                title.innerHTML = el;

                let artist = document.createElement('div')
                artist.setAttribute('class', 'artist')

                titleInfo.appendChild(title)
                titleInfo.appendChild(artist)
                track.appendChild(titleInfo)

                playlistInner.appendChild(track)
            })
        }
    }
}

// Event listeners
playOrPauseButton.addEventListener('click', playOrPause)
repeatButton.addEventListener('click', repeatAudio)

// Play or pause on pressing Space key
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

// Playlist
openPlaystlistButton.addEventListener('click', () => {
    playlistContainer.style.opacity = '1'
    playlistContainer.style.pointerEvents = 'all'
    playlistContainer.style.width = '100%'
    openPlaystlistButton.style.display = 'none'
    header.style.backgroundColor = 'rgba(37, 41, 44, 0.9)'
})

closePlaylistButton.addEventListener('click', () => {
    playlistContainer.style.pointerEvents = 'none'
    playlistContainer.style.width = '0%'
    playlistContainer.style.opacity = '0'
    openPlaystlistButton.style.display = 'block'
    header.style.backgroundColor = 'transparent'
})

// Open a folder on click
openFolderButton.addEventListener('click', () => {
    remote.dialog.showOpenDialog({properties: ['openDirectory']}).then((data) => {
        if (data.filePaths.length != 0) {
            // Create folder element to append it to HTML (playlistContainer)
            var folder = document.createElement('div')
            folder.setAttribute('class', 'track-container folder')
            var folderIconContainer = document.createElement('div')
            folderIconContainer.setAttribute('class', 'folder-icon')
            var folderIcon = document.createElement('i')
            folderIcon.setAttribute('class', 'fa fa-folder-open')
            var folderName = document.createElement('div')
            folderName.setAttribute('id', 'folderName')
            folderName.innerHTML = data.filePaths[0]

            folderIconContainer.appendChild(folderIcon)

            folder.appendChild(folderIconContainer)
            folder.appendChild(folderName)

            playlistInner.appendChild(folder)

            // Read the chosen directory
            fs.readdir(data.filePaths[0], (err, files) => {
                if (err) throw err;

                // Folder object to store folder path and files in it
                let folder = [];

                folder[data.filePaths.toString()] = []
                
                // loop through each file in the folder
                files.forEach((file) => {
                    folder.push(file); // key - folder path, value - list of mp3 files
                })

                folders.push(folder) // add to the global folders list

                console.log(folder)
                console.log(folders)
            })

            getFolderIndex();

        }  
    })
})

// Change the volume
volumeSlider.oninput = () => {
    audio.volume = volumeSlider.value;
}

var win = remote.getCurrentWindow();

ipcRenderer.on('second-instance', (e, file) => {
    console.log('File', file)
    init(file) // Swap files if second instance of app is opened
})

minimizeButton.addEventListener('click', () => {
    win.minimize()
})

// Close app on click
quitButton.addEventListener('click', () => {
    win.close();
})