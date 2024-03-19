import fs from 'fs'

import jsonArr from 'JSON file path here' assert { type: 'json' } // CHANGE THIS LINE


// goes through each key and recursively creates a new key for each nested key
const getKeys = (arr) => {
    
    let keys = new Set()
    
    // follows each path and creates a unique key for each unique path
    const createKey = (obj, keyPath = '') => {
        let newKey = ''
        
        if (obj.constructor === Array) {
            if (obj.length === 0) keys.add(keyPath)
            
            for (let i = 0; i < obj.length; i++) {
                if (typeof obj[i] === 'object' && obj[i] !== null) {
                    newKey += createKey(obj[i], keyPath + '/' + i.toString())
                }
                else keys.add(keyPath + '/' + i.toString())
            }
        }
        else {
            for (const key of Object.keys(obj)) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    newKey += '/' + key 
                    newKey += createKey(obj[key], keyPath + newKey)
                }
                else keys.add(keyPath + '/' + key)
            }
        }
        
        return newKey
    }
    
    // to get every possible key, we have to iterate through every item in the json array
    for (const obj of arr) {
        for (const key of Object.keys(obj)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) createKey(obj[key], key)
            else keys.add(key)
        }
    }

    return Array.from(keys)
}

// gets all possible keys any one object might use
const keys = getKeys(jsonArr)

let writer = fs.createWriteStream('./JSONtoCSV.csv')

// writes first key layer
let keyRow = keys.join(',') + '\r\n'
writer.write(keyRow)

// iterates through each object in the json array and writes the data to the csv file
for (const obj of json) {
    let objData = ''

    for (const key of keys) {
        const keyPath = key.split('/')
        let data = obj

        // checks if object has data for a key and gets it if it does
        while (keyPath.length > 0) {
            const keyStone = keyPath.shift()
            try {
                data = data[keyStone]
            } catch (err) {
                data = null
                break
            }
        }

        if (!data) {
            objData += ','
            continue
        }

        // formats to be compatible with csv
        data = data.toString()
        data = data.replace('\n', ' ')
        data = data.replace('"', '""')
        if (new RegExp('/,/').test(data)) data = '"' + data + '"'

        objData += data + ','
    }

    objData += '\r\n'
    
    writer.write(objData)
}
    