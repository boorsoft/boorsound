const electron = require('electron')
const remote = electron.remote
const fs = require('fs')
const path = require('path')
const mm = require('musicmetadata')

const quitButton = document.querySelector('.app-quit-button')
const coverContainer = document.querySelector('.cover-container')
const trackTitle = document.querySelector('#trackTitle')
const artist = document.querySelector('#artist')

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

// Close app on click
quitButton.addEventListener('click', () => {
    var window = remote.getCurrentWindow();
    window.close();
})