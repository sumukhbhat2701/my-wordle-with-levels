const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.key-container')
const messageDisplay = document.querySelector('.message-container')
const scoreCard = document.querySelector(".score")

function getScore()
{
    fetch('/getScore')
  .then(response => response.json())
  .then(json => {
      const arr = json.split(";");
      scoreCard.textContent = "Your score = "+ parseInt(arr[0]) + ". Your level = "+ parseInt(arr[1]);
  })
  .catch(err => console.log(err))
}

getScore();

function postScore(s, l, c)
{   
    fetch("/postScore", {
    method: "POST",
    body: JSON.stringify({"score": s, "level": l, "currlevScore": c}),
    headers: { "Content-Type": "application/json" }
  }).then(res => {
    console.log("Request complete! response:", res);
  });
}


setTimeout(() => {}, 60000)

let wordle

const getWordle = () => {
    fetch('/word')
        .then(response => response.json())
        .then(json => {
            wordle = json.toUpperCase()
        })
        .catch(err => console.log(err))
}
getWordle()

const keys = [
    'Q',
    'W',
    'E',
    'R',
    'T',
    'Y',
    'U',
    'I',
    'O',
    'P',
    'A',
    'S',
    'D',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'BACK',
    'Z',
    'X',
    'C',
    'V',
    'B',
    'N',
    'M',
    'ENTER',
]
const guessRows = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
]
let currentRow = 0
let currentTile = 0
let isGameOver = false

const calculateScore = (numGuesses, timeTaken) => {

    fetch('/getScore')
   .then(response => response.json())
   .then(json => {
        let arr = json.split(";");
        let score = parseInt(arr[0]);
        let lev = parseInt(arr[1]);
        let curr = parseInt(arr[2]);
        
        let s = Math.round(18000/(numGuesses*(300 - timeTaken)));
        score+=s;
        if(score >= curr*100)
        {
            while(score >= curr*100)
            {
                curr*=2;
                lev+=1;
            }
            showMessage('Magnificent! You scored '+s+" points and an level update. Redirecting to another game 10 seconds.")
        }
        else
            showMessage('Magnificent! You scored '+s+" points. Redirecting to another game 10 seconds.")
        postScore(score, lev, curr);
        scoreCard.textContent = "Your score = "+ score + ". Your level = "+ lev;
   })
   .catch(err => console.log(err))
}

guessRows.forEach((guessRow, guessRowIndex) => {
    const rowElement = document.createElement('div')
    rowElement.setAttribute('id', 'guessRow-' + guessRowIndex)
    guessRow.forEach((_guess, guessIndex) => {
        const tileElement = document.createElement('div')
        tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
        tileElement.classList.add('tile')
        rowElement.append(tileElement)
    })
    tileDisplay.append(rowElement)
})

keys.forEach(key => {
    const buttonElement = document.createElement('button')
    buttonElement.textContent = key
    buttonElement.setAttribute('id', key)
    buttonElement.addEventListener('click', () => handleClick(key))
    keyboard.append(buttonElement)
})

const handleClick = (letter) => {
    if (!isGameOver) {
        if (letter === 'BACK') {
            deleteLetter()
            return
        }
        if (letter === 'ENTER') {
            checkRow()
            return
        }
        addLetter(letter)
    }
}

const addLetter = (letter) => {
    if (currentTile < 5 && currentRow < 6) {
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
        tile.textContent = letter
        guessRows[currentRow][currentTile] = letter
        tile.setAttribute('data', letter)
        currentTile++
    }
}

const deleteLetter = () => {
    if (currentTile > 0) {
        currentTile--
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
        tile.textContent = ''
        guessRows[currentRow][currentTile] = ''
        tile.setAttribute('data', '')
    }
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

var timer;
function startTimer(duration, display) {
    timer = duration;
    var minutes, seconds;
    console.log(timer)
    let showed = false;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = 0;
            isGameOver = true
            if(!showed)
            {
                showMessage('Game Over! Word was '+wordle.toUpperCase()+'  Ridirecting in 10 seconds')
                showed = true;
            }
            sleep(10000).then(() => {
                window.location.href = "/";
                return
    });
        }
    }, 1000);
    }

window.onload = function () {
    var min = 5;
    var seconds = 60 * min,
    display = document.querySelector('#time');
    startTimer(seconds, display);
};

const checkRow = () => {
    const guess = guessRows[currentRow].join('').toLowerCase();
    if(guess=='')
        return;
    if (currentTile > 4) {
        fetch(`/check?word=${guess}`)
            .then(response => response.json())
            .then(json => {
                if (json.data == 'Entry word not found') {
                    showMessage('word not in list')
                    return
                } else {
                    flipTile()
                    if (wordle.toLowerCase() == guess.toLowerCase()) {
                        calculateScore(currentRow+1, timer);
                        sleep(10000).then(() => {
                            window.location.href = "/";
                            isGameOver = true
                            return
                        });
                        
                    } else {
                        if (currentRow >= 5) {
                            isGameOver = true
                            getScore();
                            showMessage('Game Over! Word was '+wordle.toUpperCase()+'  Ridirecting in 10 seconds')
                            sleep(10000).then(() => {
                                window.location.href = "/";
                                return
                            });
                        }
                        if (currentRow < 5) {
                            getScore();
                            currentRow++
                            currentTile = 0
                        }
                    }
                }
            }).catch(err => console.log(err))
    }
}

const showMessage = (message) => {
    const messageElement = document.createElement('p')
    messageElement.textContent = message
    messageDisplay.append(messageElement)
    setTimeout(() => messageDisplay.removeChild(messageElement), 5000)
}

const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter)
    key.classList.add(color)
}

const flipTile = () => {
    const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes
    let checkWordle = wordle
    const guess = []

    rowTiles.forEach(tile => {
        guess.push({letter: tile.getAttribute('data'), color: 'grey-overlay'})
    })

    guess.forEach((guess, index) => {
        if (guess.letter == wordle[index]) {
            guess.color = 'green-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    guess.forEach(guess => {
        if (checkWordle.includes(guess.letter)) {
            guess.color = 'yellow-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    rowTiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('flip')
            tile.classList.add(guess[index].color)
            addColorToKey(guess[index].letter, guess[index].color)
        }, 500 * index)
    })
}

