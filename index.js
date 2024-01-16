import { options } from "./data/option.js";

const cardContainer = document.querySelector('.card-container');
const result = document.querySelector('.result');
const select = document.querySelector('select');
const showTiles = document.querySelector('.show-tiles');
const controllers = document.querySelector('.controllers');
const moves = document.querySelector('.moves');
const time = document.querySelector('.time');
const start = document.querySelector('.start');
const pause = document.querySelector('.pause');
const reset = document.querySelector('.reset');
const dropdown = document.querySelectorAll('option');
const jsConfetti = new JSConfetti()

let individualTiles = [];
let optionsCopy = [...options];
let flipIndex = [];
let newOptions = [];
let tileNumber = 0;
let iteration = 0;
let count = 0;
let minutes = 0;
let seconds = 0;
let startTimer;
checkwidth();

// check for the window's width and display the required select dropdown
function checkwidth() {
    if (window.innerWidth < 480) {
        dropdown.forEach(option => {
            if (option.value > 25) {
                option.disabled = true;
            }
        })
    } else {
        dropdown.forEach(option => {
            if (option.value > 0) {
                option.disabled = false;
            }
        })
    }
}

// display the tiles grid
function getTiles() {
    if (tileNumber != 0) {
        cardContainer.style.display = 'grid';
        controllers.style.display = 'block';
        select.disabled = true;
        showTiles.disabled = true;
        tileStyle();
        getTileItems();
        renderTiles();
        
    }
}

// style each image tile
function tileStyle() {
    switch (tileNumber) {
        case 16: 
            createTyleStyle(4, 4);
            break;
        case 20: 
            createTyleStyle(5, 4);
            break;
        case 24:
            createTyleStyle(6, 4);
            break;
        case 30: 
            createTyleStyle(5, 6);
            break;
        case 36: 
            createTyleStyle(6, 6);
            break;
        case 48: 
            createTyleStyle(6, 8);
            break;
        default: 
            break;
    }
}
function createTyleStyle(row, column) {
    cardContainer.style.width = `${75 * column}px`;
    cardContainer.style.height = `${75 * row}px`;
    cardContainer.style.gridTemplateRows = `repeat(${row}, 1fr)`;
    cardContainer.style.gridTemplateColumns = `repeat(${column}, 1fr)`;
}

// get the images to be displayed from the options array
function getTileItems() {
    iteration = tileNumber / 2;

    for (let i = 0; i < iteration; i++) {
        let randIndex = Math.floor(Math.random() *  optionsCopy.length);
        newOptions.push(optionsCopy[randIndex]);
        optionsCopy.splice(randIndex, 1);
    }
}

// render the tiles to the DOM
function renderTiles() {
    let renderedOptions = [...newOptions, ...newOptions];

    // Fisher-Yates Algorithm to shuffle an array
    for(let i = renderedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = renderedOptions[i];
        renderedOptions[i] = renderedOptions[j];
        renderedOptions[j] = temp;
    }

    renderedOptions.forEach((item, index) => {
        cardContainer.innerHTML += `
            <div class='individual-tile flipped' data-value=${item.name} data-index=${index}>
                <div class='tile-before'>⭐</div>
                <div class='tile-after'>
                    <img src=${item.imgSrc} />
                </div>
            </div>
        `
    })

    start.disabled = true;
    individualTiles = document.querySelectorAll('.individual-tile');
    // remove flippled class once tiles renders to the DOM
    setTimeout(() => {
        individualTiles.forEach(tile => tile.classList.remove('flipped'));
        start.disabled = false;
    }, tileNumber > 25 ? 4500 : 1500);
    
}

// handle each tile flip
function flipEvent(e) {
        if (e.currentTarget.classList[1] !== 'flipped') {
            e.currentTarget.classList.add('flipped');
            count += 1;
            flipIndex.push(e.currentTarget);
            moves.textContent = count;

            if(flipIndex.length == 2) {
                checker();
                flipIndex = [];
            }
        }
}

// checks the first and second flipped item if they match
function checker() {
    let {value: firstValue, index: firstIndex} = flipIndex[0].dataset;
    let {value: secondValue, index: secondIndex} = flipIndex[1].dataset;

    if (firstValue != secondValue) {
        // removes the flipped class if the two images don't match
        setTimeout(() => {
            individualTiles[+firstIndex].classList.remove('flipped');
            individualTiles[+secondIndex].classList.remove('flipped');
        }, 500)
    } else {
        issueVerdict()
    }
}

// checks if all tiles has been flipped
function issueVerdict () {
    let holder = [];
    individualTiles.forEach(item => {
        holder.push(item.classList[1] == 'flipped');
    });
    let verdict = holder.every(val => val == true);

    if (verdict) {
        if (minutes == 0) {
            result.textContent = `Found All Match After ${count} moves under ${seconds} seconds`;
        } else {
            result.textContent = `Found All Match After ${count} moves under ${minutes} minutes ${seconds} seconds`;
        }

        clearInterval(startTimer);
        jsConfetti.addConfetti()
            .then(() => resetGame());
    }
}

// starts the timer
function timer() {
    individualTiles.forEach(tile => tile.addEventListener('click', flipEvent));
    start.disabled = true;
    pause.disabled = false;
    startTimer = setInterval(() => {
        seconds += 1;
        if (seconds == 60) {
            minutes += 1;
            seconds = 0;
        }

        time.textContent = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
    }, 1000)


    // pause the timer
    pause.addEventListener('click', () => {
        individualTiles.forEach(tile => {
            tile.removeEventListener('click', flipEvent)
        });
        start.disabled = false;
        start.textContent = 'Resume';
        pause.disabled = true;
        clearInterval(startTimer);
    });
}

// reset game
function resetGame() {
    individualTiles.forEach(tile => tile.remove());
    cardContainer.style.display = 'none';
    controllers.style.display = 'none';
    select.disabled = false;
    showTiles.disabled = false;
    clearInterval(startTimer);
    individualTiles = [];
    flipIndex = [];  
    iteration = 0;
    count = 0;
    minutes = 0;
    seconds = 0;
    start.disabled = false;
    pause.disabled = false;
    tileNumber = 0;
    result.textContent = '';
    moves.textContent = count;
    time.textContent = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
    select.value = 0;
    newOptions = [];
    optionsCopy = [...options];
}

// handle window resize
function handleResize() {
    checkwidth();
    if (window.innerWidth < 520 && tileNumber > 25) {
        resetGame();
    }
}

// Event Listeners
showTiles.addEventListener('click', getTiles);
start.addEventListener('click', timer);
reset.addEventListener('click', resetGame);
window.addEventListener('resize', handleResize);
select.addEventListener('change', (e) => tileNumber = Number(e.currentTarget.value))