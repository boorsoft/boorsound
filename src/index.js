const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
const remote = electron.remote
const fs = require('fs')
const path = require('path')
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
const backButton = document.querySelector('#backButton')

var dragging = false;
var volumeOpen = false; // volume control panel opened

const audio = new Audio();

const store = new Store()

var folders = []; // Remember the folders added by user
var currentFolder;
var currentTrack;

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
    audio.onloadedmetadata = () => {trackDuration.textContent = convertTime(Math.round(audio.duration))}
    playOrPauseButton.firstChild.className = 'fa fa-pause'

    if (file != '.') {
        // create stream to read an mp3 file
        let stream = fs.createReadStream(file)
        // get mp3 data, such as track title, artist, cover image etc.
        mm(stream, (err, data) => {

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
                bg.style.backgroundColor = 'rgba(37, 41, 44, 1)' // set bg color
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

function getFolderAbsPath(i) {
    return path.join(folders[i]['folderName']) + '\\'
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

function nextAudio() {
    if (currentTrack < folders[currentFolder].length - 1) init(getFolderAbsPath(currentFolder) + folders[currentFolder][++currentTrack])
    else {
        currentTrack = 0
        init(getFolderAbsPath(currentFolder) + folders[currentFolder][currentTrack])
    }
    getCurrentTrack()
}

function prevAudio() {
    if (currentTrack != 0) init(path.join(getFolderAbsPath(currentFolder) + folders[currentFolder][--currentTrack]))
    else init(path.join(getFolderAbsPath(currentFolder) + folders[currentFolder][0]))
    getCurrentTrack()
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
    return min + ":" + sec
}

// Get current track and style it
function getCurrentTrack() {
    playlistInner.children[currentTrack].style.backgroundColor = 'rgba(37, 41, 44, 0.85)' // set the background of the current track
    // loop through each track
    for(let i = 0; i < playlistInner.children.length; i++) {
        if (i != currentTrack) playlistInner.children[i].style.backgroundColor = '' // unset the background except the current track
    }
}

function updateFolder() {
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

                let artist = document.createElement('div')
                artist.setAttribute('class', 'artist')

                let durationInfo = document.createElement('div')
                durationInfo.setAttribute('class', 'duration-info-playlist')

                let stream = fs.createReadStream(getFolderAbsPath(i) + el) // read files in folder

                // set music metadata
                mm(stream, (err, data) => {
                    if (err) throw err;

                    if (data['artist'].length != 0) artist.innerHTML = data['artist']
                    else artist.innerHTML = 'Unknown'

                    if (data['title'].length != 0) title.innerHTML = data['title']
                    else title.innerHTML = 'No Title'

                    let song = new Audio()
                    song.src = getFolderAbsPath(i) + el
                    song.onloadedmetadata = () => {
                        durationInfo.innerHTML = convertTime(Math.round(song.duration));
                    }

                })

                titleInfo.appendChild(title)
                titleInfo.appendChild(artist)
                track.appendChild(titleInfo)
                track.appendChild(durationInfo)

                playlistInner.appendChild(track)

                // Swap files on track click
                track.addEventListener('click', () => {
                    init(getFolderAbsPath(i) + el)
                    currentFolder = i; // remember what folder is track from
                    currentTrack = folders[i].indexOf(el) // remember the track index
                    getCurrentTrack()
                })
                
            })

            backButton.style.display = 'block' // Enable the button to get back to the folder list
        }
    }
}

// A  function to create a folder element to append it to HTML (playlistContainer)
function createFolderElement({data = null, f = null}) {    
    var folder = document.createElement('div')
    folder.setAttribute('class', 'track-container folder')
    var folderIconContainer = document.createElement('div')
    folderIconContainer.setAttribute('class', 'folder-icon')
    var folderIcon = document.createElement('i')
    folderIcon.setAttribute('class', 'fa fa-folder-open')
    var folderName = document.createElement('div')
    folderName.setAttribute('id', 'folderName')
    if (data) folderName.innerHTML = data.filePaths[0]
    else folderName.innerHTML = f

    folderIconContainer.appendChild(folderIcon)

    folder.appendChild(folderIconContainer)
    folder.appendChild(folderName)

    playlistInner.appendChild(folder)
}

// Event listeners
playOrPauseButton.addEventListener('click', playOrPause)
nextButton.addEventListener('click', nextAudio)
prevButton.addEventListener('click', prevAudio)
repeatButton.addEventListener('click', repeatAudio)

// Play or pause on pressing Space key
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') playOrPause()
})

// Update fillbar 
audio.addEventListener('timeupdate', () => {
    var position = audio.currentTime / audio.duration;
    trackCurrentTime.textContent = convertTime(Math.round(audio.currentTime))

    fillbar.style.width = position * 100 + '%'  

    if (audio.ended) {
        if (repeat) {
            audio.play()
        } else {
            playOrPauseButton.firstChild.className = 'fa fa-play'
            
            nextAudio()
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
            createFolderElement({data: data})

            // Read the chosen directory
            fs.readdir(data.filePaths[0], (err, files) => {
                if (err) throw err;

                // Folder object to store folder path and files in it
                let folder = [];

                folder['folderName'] = data.filePaths.toString()
                
                // loop through each file in the folder
                files.forEach((file) => {
                    folder.push(file); // key - folder path, value - list of mp3 files
                })

                folders.push(folder) // add to the global folders list

            })

            updateFolder();

        }  
    })
})

// Erase track elements and create folder elements on click
backButton.addEventListener('click', () => {
    backButton.style.display = 'none'
    playlistInner.innerHTML = ''

    folders.forEach((f) => {
        createFolderElement({f: f['folderName']})
    })

    updateFolder()
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