"use strict";

let MSGame = (function(){

    // private constants
    const STATE_HIDDEN = "hidden";
    const STATE_SHOWN = "shown";
    const STATE_MARKED = "marked";

    function array2d( nrows, ncols, val) {
        const res = [];
        for( let row = 0 ; row < nrows ; row ++) {
        res[row] = [];
        for( let col = 0 ; col < ncols ; col ++)
            res[row][col] = val(row,col);
        }
        // console.log(res);
        return res;
    }

    // returns random integer in range [min, max]
    function rndInt(min, max) {
        [min,max] = [Math.ceil(min), Math.floor(max)]
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    class _MSGame {    
        constructor() {
            console.log("DEFAULT INIT");
            this.init(8,10,10); // default is easy mode
        }

        validCoord(row, col) {
            return row >= 0 && row < this.nrows && col >= 0 && col < this.ncols;
        }

        init(nrows, ncols, nmines) {
            let timer = document.getElementById('timer');
            var totalSeconds = 0;
            timer.innerHTML = 0;
            var intervalId = setInterval(setTime, 1000);

            function setTime() {
                ++totalSeconds;
                timer.innerHTML = totalSeconds;
            }

            function clearTime() {
                clearInterval(intervalId);
            }

            document.getElementById("btnContainer").innerHTML = '';
            this.nrows = nrows;
            this.ncols = ncols;
            this.nmines = nmines;
            this.nmarked = 0;
            this.nuncovered = 0;
            this.exploded = false;
            this.flags = nmines; // flags allowed to be used
            let flagCount = document.getElementById('flagCount');
            flagCount.innerHTML = this.flags;
            let container = document.getElementById('btnContainer'); // Hold buttons
            let buttonSize = container.clientWidth / ncols;            
            container.style.gridTemplateColumns = `repeat(${ncols}, ${buttonSize}px)`;
            container.style.gridTemplateRows = `repeat(${nrows}, ${buttonSize}px)`;
            // create an array
            this.arr = array2d(nrows, ncols, createButtons);            
            // Dynamic button creation
            function createButtons(row, col) {
                let button = document.createElement('button');
                button.classList.add("btn");
                button.dataset.mine;
                button.dataset.state = STATE_HIDDEN;
                button.dataset.count = 0;
                button.dataset.buttonId = (row*10)+(col+1);
                button.dataset.row = row;
                button.dataset.col = col;

                // Algorithm for setting color pattern of the buttons
                if(((button.dataset.row % 2) && !(button.dataset.buttonId % 2)) || (!(button.dataset.row % 2) && (button.dataset.buttonId % 2))) {
                    button.style.backgroundColor = "#A7D948"; //#E5C29F: light beige
                    button.dataset.shade = 'light'; // either light beige or light green
                }
                else {
                    button.style.backgroundColor = "#8ECC39"; //#D7B899: dark beige
                    button.dataset.shade = 'dark'; // either dark beige or dark green
                }
                button.style.borderStyle = "hidden";

                container.append(button); // add the created button to the container: 'btnContainer'
                return button;
            }          
            
            // Button Listeners
            // Button LEFT click event handler using a delegate
            let self = this;
            container.addEventListener('click', respondLeftClick);
            function respondLeftClick(e) {
                if(e.target && e.target.classList.contains("btn") && e.target.dataset.state != STATE_MARKED) {
                    self.showButton(e.target);
                    self.uncover(e.target.dataset.row, e.target.dataset.col); 
                    console.log(self.getRendering().join("\n"));               
                    console.log(self.getStatus());
                }
                if(self.getStatus().done) {
                    console.log("GAME OVER");
                    clearTime();
                    container.removeEventListener('click', respondLeftClick);
                    container.removeEventListener('contextmenu', respondRightClick);                    
                    var popup = document.getElementById("gameDone");
                    popup.classList.add("show");
                    popupButton.classList.add("show");              
                    if(self.getStatus().exploded === true)  popup.innerHTML = 'You Lose...';
                    else popup.innerHTML = 'You Win!';
                    popupButton.addEventListener('click', respondTryAgain);
                }
            }
            var popupButton = document.getElementById("tryAgain");
            function respondTryAgain() {
                self.resetButtonContainer();
                easy.removeEventListener('click', easyModeReset);
                medium.removeEventListener('click', mediumModeReset);
                popupButton.removeEventListener('click', respondTryAgain);
                self.arr = 0;                        
                self.init(8,10,10); // easy
            }
            // Button RIGHT click handler
            container.addEventListener('contextmenu', respondRightClick);
            function respondRightClick(e) {                
                e.preventDefault();
                if(self.nuncovered == 0) return;
                // console.log("right click");
                if(e.target && e.target.dataset.state == STATE_SHOWN) return; 
                if(e.target && e.target.classList.contains("btn") && self.flags > 0) {
                    if(self.mark(e.target.dataset.row, e.target.dataset.col)) {
                        // console.log("adding flag");
                        e.target.innerHTML = '<i class="fas fa-flag fa-1g"></i>'; // flag this
                        e.target.dataset.state = STATE_MARKED;
                        e.target.style.color = "red";
                        self.flags--;
                    }   
                    else {
                        // console.log("removing flag - btn rclick");
                        e.target.innerHTML = '';
                        e.target.dataset.state = STATE_HIDDEN;
                        e.target.style.color = "black";
                        self.flags++;  
                    }
                }
                else if(e.target.closest("button") && e.target.closest("button").classList.contains("btn") && e.target.closest("button").dataset.state == STATE_MARKED){
                    // console.log("removing flag - i click");
                    e.target.closest("button").dataset.state = STATE_HIDDEN;
                    e.target.closest("button").style.color = "black";
                    e.target.closest("button").innerHTML = '';
                    self.flags++;
                } 
                console.log("Flags: ", self.flags);   
                console.log(self.getRendering().join("\n"));
                console.log(self.getStatus());
            }
            // JQuery TapHold Handler
            $(function(){
                $(container).bind( "taphold", respondRightClick);
                // $( "button" ).bind( "taphold", tapholdHandler);
                // function tapholdHandler( event ){
                //     $(event.target).addClass( "taphold" );
                // }
            });

            let easy = document.getElementById('easy');
            let medium = document.getElementById('medium');
            easy.addEventListener('click', easyModeReset);
            function easyModeReset() {
                console.log("RESET EASY");
                container.removeEventListener('click', respondLeftClick);
                container.removeEventListener('contextmenu', respondRightClick);
                easy.removeEventListener('click', easyModeReset);
                medium.removeEventListener('click', mediumModeReset);
                self.resetButtonContainer();   
                self.arr = 0;           
                clearTime();
                self.init(8,10,10); // easy
            }
            medium.addEventListener('click', mediumModeReset);     
            function mediumModeReset() {
                console.log("RESET MEDIUM");
                container.removeEventListener('click', respondLeftClick);
                container.removeEventListener('contextmenu', respondRightClick);
                easy.removeEventListener('click', easyModeReset);
                medium.removeEventListener('click', mediumModeReset);
                self.resetButtonContainer();
                self.arr = 0;
                clearTime();
                self.init(14,18,40) // medium
            }       
        }
        resetButtonContainer() {
            document.getElementById("btnContainer").innerHTML = '';
            var popup = document.getElementById("gameDone");
            popup.classList.remove("show");
            var popupButton = document.getElementById("tryAgain");
            popupButton.classList.remove("show");
        }
        showButton(b) {
            if(b.dataset.mine) {
                b.innerHTML = '<div style="text-align: center;"><i class="fas fa-circle fa-1g"></i></div>'; // bomb is clicked
                b.style.backgroundColor = "#" + Math.floor(Math.random()*16777215).toString(16);
                return;
            }
            if(b.dataset.shade === 'dark') b.style.backgroundColor = "#D7B899";
            else b.style.backgroundColor = "#E5C29F";
            if(b.dataset.count > 0) b.innerHTML = b.dataset.count;             
        }
        count(row,col) {
            const c = (r,c) =>
                    (this.validCoord(r,c) && this.arr[r][c].dataset.mine ? 1 : 0);
            let res = 0;
            for( let dr = -1 ; dr <= 1 ; dr ++ )
                for( let dc = -1 ; dc <= 1 ; dc ++ )
                res += c(row+dr,col+dc);
            return res;
        }
        sprinkleMines(row, col) {
                // prepare a list of allowed coordinates for mine placement
            let allowed = [];
            for(let r = 0 ; r < this.nrows ; r ++ ) {
                for( let c = 0 ; c < this.ncols ; c ++ ) {
                if(Math.abs(row-r) > 2 || Math.abs(col-c) > 2)
                    allowed.push([r,c]);
                }
            }
            this.nmines = Math.min(this.nmines, allowed.length);
            for( let i = 0 ; i < this.nmines ; i ++ ) {
                let j = rndInt(i, allowed.length-1);
                [allowed[i], allowed[j]] = [allowed[j], allowed[i]];
                let [r,c] = allowed[i];
                this.arr[r][c].dataset.mine = true;
            }
            // erase any marks (in case user placed them) and update counts
            for(let r = 0 ; r < this.nrows ; r ++ ) {
                for( let c = 0 ; c < this.ncols ; c ++ ) {
                if(this.arr[r][c].dataset.state == STATE_MARKED)
                    this.arr[r][c].dataset.state = STATE_HIDDEN;
                this.arr[r][c].dataset.count = this.count(r,c);
                }
            }
            let mines = []; let counts = [];
            for(let row = 0 ; row < this.nrows ; row ++ ) {
                let s = "";
                for( let col = 0 ; col < this.ncols ; col ++ ) {
                    console.log(this.arr[row][col].dataset.mine);
                    s += this.arr[row][col].dataset.mine ? "B" : ".";
                }
                s += "  |  ";
                for( let col = 0 ; col < this.ncols ; col ++ ) {
                    s += this.arr[row][col].dataset.count.toString();
                }
                mines[row] = s;
            }
            console.log("Mines and counts after sprinkling:");
            console.log(mines.join("\n"), "\n");
        }
        uncover(row, col) {
            row = Number(row);
            col = Number(col);
            console.log("uncover", row, col);
            // if coordinates invalid, refuse this request
            if( ! this.validCoord(row,col)) return false;
            // if this is the very first move, populate the mines, but make
            // sure the current cell does not get a mine
            if( this.nuncovered === 0) 
                this.sprinkleMines(row, col);
            // if cell is not hidden, ignore this move
            if( this.arr[row][col].dataset.state !== STATE_HIDDEN) return false;
            // floodfill all 0-count cells
            const ff = (r,c) => {                
                if( ! this.validCoord(r,c)) return;    
                // console.log("r is: ", r, ", c is: ", c);            
                if( this.arr[r][c].dataset.state !== STATE_HIDDEN) return;                
                this.arr[r][c].dataset.state = STATE_SHOWN;
                this.showButton(this.arr[r][c]);       
                this.nuncovered ++;
                if( this.arr[r][c].dataset.count != 0) return;
                ff(r-1,c-1);ff(r-1,c);ff(r-1,c+1);
                ff(r  ,c-1);         ;ff(r  ,c+1);
                ff(r+1,c-1);ff(r+1,c);ff(r+1,c+1);
            };
            ff(row,col);
            // have we hit a mine?
            if( this.arr[row][col].dataset.mine) {
                this.exploded = true;
            }
            return true;        
        }
        // puts a flag on a cell
        // this is the 'right-click' or 'long-tap' functionality
        mark(row, col) {
            console.log("mark", row, col);
            // if coordinates invalid, refuse this request
            if( ! this.validCoord(row,col)) return false;
            // if cell already uncovered, refuse this
            console.log("marking previous state=", this.arr[row][col].dataset.state);
            if( this.arr[row][col].dataset.state === STATE_SHOWN) return false;
            // accept the move and flip the marked status
            this.nmarked += this.arr[row][col].dataset.state == STATE_MARKED ? -1 : 1;
            this.arr[row][col].dataset.state = this.arr[row][col].dataset.state == STATE_MARKED ?
                STATE_HIDDEN : STATE_MARKED;
            // if the new state us hidden, return false
            if(this.arr[row][col].dataset.state == STATE_HIDDEN) {
                this.arr[row][col].innerHTML = '';
                return false;
            }
            return true;
        }
        // returns array of strings representing the rendering of the board
        //      "H" = hidden cell - no bomb
        //      "F" = hidden cell with a mark / flag
        //      "M" = uncovered mine (game should be over now)
        // '0'..'9' = number of mines in adjacent cells
        getRendering() {
            const res = [];
            for( let row = 0 ; row < this.nrows ; row ++) {
                let s = "";
                for( let col = 0 ; col < this.ncols ; col ++ ) {
                let a = this.arr[row][col];
                if( this.exploded && a.dataset.mine) s += "M";    
                else if( a.dataset.state === STATE_HIDDEN) s += "H";
                else if( a.dataset.state === STATE_MARKED) s += "F";
                else if( a.dataset.mine) s += "M";
                else s += a.dataset.count.toString();
                }
                res[row] = s;
            }
            return res;
        }
        // blow up remaining mines if you lose
        blowUpMines() {
            this.arr.forEach(function(r) {
                r.forEach(boom)
            });
            function boom(elem) {
                if(elem.dataset.mine) {
                elem.innerHTML = '<div style="text-align: center;"><i class="fas fa-circle fa-1g"></i></div>'; // bomb is clicked
                elem.style.backgroundColor = "#" + Math.floor(Math.random()*16777215).toString(16);
                }
            }            
        }
        getStatus() {
            let done = this.exploded ||
                this.nuncovered === this.nrows * this.ncols - this.nmines;
            if(this.exploded) {
                this.blowUpMines();
            }
            let flagCount = document.getElementById('flagCount');
            flagCount.innerHTML = this.flags;
            return {
                done: done,
                exploded: this.exploded,
                nrows: this.nrows,
                ncols: this.ncols,
                nmarked: this.nmarked,
                nuncovered: this.nuncovered,
                nmines: this.nmines
            }
        }
    }
    return _MSGame;

})();

let game = new MSGame();
