import fs from 'fs'

import cardsInfo from './DefaultCardInfo.json' assert { type: 'json' }


// recursively goes through each key and recursively creates a new key for each nested key
const getKeys = () => {
    
    let keys = new Set()
    
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
    
    for (const card of cardsInfo) {
        for (const key of Object.keys(card)) {
            if (typeof card[key] === 'object' && card[key] !== null) createKey(card[key], key)
            else keys.add(key)
        }
    }

    return Array.from(keys)
}

const keys = getKeys()

console.log(keys.length)

// console.log(keys)

let writer = fs.createWriteStream('./CardInfo.csv')

let keyRow = keys.join(',') + '\r\n'
writer.write(keyRow)

for (const card of cardsInfo) {
    let cardInfo = ''

    for (const key of keys) {
        const keyPath = key.split('/')
        let data = card

        while (keyPath.length > 0) {
            const keyStone = keyPath.shift()
            try {
                data = data[keyStone]
            } catch (err) {
                continue
            }
        }

        if (!data) {
            cardInfo += ','
            continue
        }

        data = data.toString()
        data = data.replace('\n', ' ')
        data = data.replace('"', '""')
        data = data.replace('—', '-')

        if (new RegExp('/,/').test(data)) data = '"' + data + '"'

        cardInfo += data + ','
    }

    cardInfo += '\r\n'
    
    writer.write(cardInfo)
}
    