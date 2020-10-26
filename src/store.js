const electron = require('electron')
const path = require('path')
const fs = require('fs')

class Store {
    constructor() {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData')
        this.path = path.join(userDataPath, 'userdata.json')
        this.data = readData(this.path, {'repeat': "false"})
        console.log(this.data)
    }

    // get data by key
    get(key) {
        return this.data[key]
    }

    // Save a file by key value pair
    set(key, value) {
        this.data[key] = value;
        fs.writeFileSync(this.path, JSON.stringify(this.data))
    }

}

// Read parsed data from a file
function readData(filePath, defaultData) {
    try {
        return JSON.parse(fs.readFileSync(filePath))
    } catch(err) {
        return defaultData;
    } 
}

module.exports = Store;