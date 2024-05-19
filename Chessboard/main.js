
function colorCells() //а есть ли смысл? можно изначально прописать, просто влом
{
    let evenCol = ["B","D","F","H"]
    let elements = document.querySelectorAll(".cell")

    for (let elem of elements)
    {
        let place = elem.id.split("");
        if ( 
            (evenCol.includes(place[0]) && Number(place[1]) % 2 == 0) ||
            (!evenCol.includes(place[0]) && Number(place[1]) % 2 == 1) 
        )
        {
            elem.classList.add("black");
        }
        else
        {
            elem.classList.add("white");
        }
    }
}

function Figure(coordinates, figure)
{
    this.color = figure[0];
    this.type = figure[1];
    this.coordinates = coordinates;
    this.moved = false; //двигался ли с начала партии
    
    this.getZone = moveZone; //определение ниже

    this.move = moveFigure;
    /*function(newCoord)
    {
        setFigure(this.coordinates, '0');
        setFigure(newCoord, this.color+this.type, this);
        lastMove = [this.coordinates, newCoord];
        showLastMove(lastMove);
        this.coordinates = newCoord;
        this.moved = true;
        
    };*/

    this.specialMoves = []; //рокировка , взятие на проходе, превращение пешки
    //если фигура выделена, и есть ход, который ведет к перечисленному, он указан здесь
    return this;
}

function moveFigure(newCoord)
{
    console.log(this.specialMoves.map(elem => coordToDesk(elem) ) );
    
    
    if ( this.specialMoves.some( elem => isEqual(elem, newCoord) ) ) //особенный ход - вот здесь уже подумать
    {   
        console.log("ALARM");
        if ( this.type == 'P' ) //пешка
        {
            if ([0,7].includes(newCoord[0] ) ) //превращение
                {
                    console.log("TRANSFORMATION"); //доделать
                }
            if ( [2,5].includes(newCoord[0]) ) //взятие на проходе
                {
                let eatenPawn = [newCoord[0] + ( (this.color == 'W') ? 1 : -1), newCoord[1] ];
                setFigure(eatenPawn, '0');
                console.log(`takingpawn ${coordToDesk(eatenPawn)}`);
                }
        }

        if (this.type == 'K')
        {
            console.log('roque');
        }
    }

    setFigure(this.coordinates, '0'); //оставляем после себя пустое место
    setFigure(newCoord, this.color+this.type, this); //ставим фигуру на новое

    lastMove = [this.coordinates, newCoord]; //запоминаем ход
    showLastMove(lastMove);  //чтобы его обозначить (не только)

    this.coordinates = newCoord;
    this.moved = true;

}


//эта фигня длиной три километра, лучше так описать чем пихать в конструктор
function moveZone(board) // возвращает массив координат возможных ходов для фигур на доске
{
    let res = [];
    this.specialMoves = [];
    switch (this.type)
    {
    case 'R': 
        for (cell of moveDirection(board, [-1,0], this) ) //можно(?) синтаксически упростить 
            res.push( cell );
        for (cell of moveDirection(board, [1,0], this) )
            res.push( cell );
        for (cell of moveDirection(board, [0,-1], this) )
            res.push( cell );
        for (cell of moveDirection(board, [0,1], this) )
            res.push( cell );
        break;
    case 'N':
        for (let i = 0; i < 8; i++ )
            for (let j = 0; j < 8; j++ )
                if (
                    (
                    ( (this.coordinates[0] == i+2) || (this.coordinates[0] == i-2) ) ? 
                       ( ( (this.coordinates[1] == j+1)||(this.coordinates[1]==j-1)  )? true : false) :
                       ( (this.coordinates[0] == i+1) || (this.coordinates[0] == i-1) )?
                       ( ( (this.coordinates[1] == j+2)||(this.coordinates[1]==j-2)  )? true : false) : false
                    ) && ( board[i][j] [0] != this.color )
                    )
                    {
                    res.push( [i,j] );
                    }
        break;
    case 'B':
        for (cell of moveDirection(board, [-1,-1], this) )
            res.push( cell );
        for (cell of moveDirection(board, [-1,1], this) )
            res.push( cell );
        for (cell of moveDirection(board, [1,-1], this) )
            res.push( cell );
        for (cell of moveDirection(board, [1,1], this) )
            res.push( cell );
        break;
    case 'Q':
        for (cell of moveDirection(board, [-1,-1], this) ) 
            res.push( cell );
        for (cell of moveDirection(board, [-1,1], this) )
            res.push( cell );
        for (cell of moveDirection(board, [1,-1], this) )
            res.push( cell );
        for (cell of moveDirection(board, [1,1], this) )
            res.push( cell );
        for (cell of moveDirection(board, [-1,0], this) )
            res.push( cell );
        for (cell of moveDirection(board, [1,0], this) )
            res.push( cell );
        for (cell of moveDirection(board, [0,-1], this) )
            res.push( cell );
        for (cell of moveDirection(board, [0,1], this) )
            res.push( cell );
        break;
    case 'K':
        
        for (let i = 0; i < 8; i++ )
            for (let j = 0; j < 8; j++ )
            
                if ( 
                    ( 
                    (this.coordinates[0]==i)||
                    (this.coordinates[0]==i+1)||
                    (this.coordinates[0]==i-1) 
                    ) && (
                    (this.coordinates[1]==j)||
                    (this.coordinates[1]==j+1)||
                    (this.coordinates[1]==j-1)                 
                    ) && ( 
                    !isEqual(this.coordinates, [i,j]) //сами в себя не ходим
                    ) && (
                    board[i][j][0] != this.color ) //не ходим в своих
                )
                    {
                        res.push( [i,j] );
                    }
        // проверки на рокировки. можно упростить
        //короткая рокировка
        if ( !this.moved && //король не двигался
            board[this.coordinates[0] ][5] == '0' && // клетки между королем и ладьей пусты
            board[this.coordinates[0] ][6] == '0' && //
            board[this.coordinates[0] ][7] == this.color + 'R' && // в конце стоит ладья своего цвета
            res.some( elem => isEqual(elem, [this.coordinates[0], 5] ) ) && // клетки движения короля не под атакой
            !document.getElementById( coordToDesk( [this.coordinates[0],7] ) ).figure.moved //и ладья не двигалась 
            )
            {
            this.specialMoves.push( [this.coordinates[0], 6] );
            res.push( [this.coordinates[0], 6] );
            }
        //длинная рокировка
        if ( !this.moved && //король не двигался
            board[this.coordinates[0] ][3] == '0' && // клетки между королем и ладьей пусты
            board[this.coordinates[0] ][2] == '0' && //
            board[this.coordinates[0] ][1] == '0' && //
            board[this.coordinates[0] ][0] == this.color + 'R' && // в конце стоит ладья своего цвета
            res.some( elem => isEqual(elem, [this.coordinates[0], 3] ) ) && // клетки движения короля не под атакой
            !document.getElementById( coordToDesk( [this.coordinates[0],0] ) ).figure.moved //и ладья не двигалась 
            )
            {
            this.specialMoves.push( [this.coordinates[0], 2] );
            res.push( [this.coordinates[0], 2] );
            }
        break;
    case 'P':

        let dir = this.color == "W" ? -1 : 1; //в какую сторону перед
        
        if ( board[ this.coordinates[0] + dir][this.coordinates[1]] == '0' ) 
                res.push( [this.coordinates[0] + dir,this.coordinates[1]] ); //вперед

        if (!this.moved && board[ this.coordinates[0] + 2*dir][this.coordinates[1]] == '0' && board[ this.coordinates[0] + dir][this.coordinates[1]] == '0' )
            res.push( [this.coordinates[0] + 2*dir,this.coordinates[1]] ); //дважды вперед, если не двигались

        if ( this.coordinates[1] != 0 && ![this.color, '0'].includes( board[ this.coordinates[0] + dir][this.coordinates[1]-1] [0] ) )
            res.push( [this.coordinates[0] + dir,this.coordinates[1]-1] ); //слева враг
        if ( this.coordinates[1] != 7 && ![this.color, '0'].includes(  board[ this.coordinates[0] + dir][this.coordinates[1]+1] [0] )  )
            res.push( [this.coordinates[0] + dir,this.coordinates[1]+1] ); //справа враг

        // проверка на взятие на проходе
        if (lastMove != undefined)
        {
            if  (isEqual( lastMove[0], [this.coordinates[0] + 2*dir,this.coordinates[1]-1]) && //стоял слева - 2х спереди
                 isEqual( lastMove[1], [this.coordinates[0], this.coordinates[1]-1]) &&  //теперь стоит строго слева
                 board[ this.coordinates[0] ][this.coordinates[1]-1] [0] != this.color && //стоит там фигура оппонента, возможно лишнее(как-бы само собой, ходы же по очереди)
                 board[ this.coordinates[0] ][this.coordinates[1]-1] [1] == 'P' //оппонент ходил пешкой
                ) 
                {
                this.specialMoves.push([this.coordinates[0] + dir,this.coordinates[1]-1] );
                res.push ( [this.coordinates[0] + dir,this.coordinates[1]-1] );
                }

            if  (isEqual( lastMove[0], [this.coordinates[0] + 2*dir,this.coordinates[1]+1]) && //то же самое, но справа
                 isEqual( lastMove[1], [this.coordinates[0], this.coordinates[1]+1]) &&
                 board[ this.coordinates[0] ][this.coordinates[1]+1] [0] != this.color &&
                 board[ this.coordinates[0] ][this.coordinates[1]+1] [1] == 'P'  
                )
                {
                this.specialMoves.push([this.coordinates[0] + dir,this.coordinates[1]+1] );
                res.push ( [this.coordinates[0] + dir,this.coordinates[1]+1] );
                }
        }

        // *проверка на превращение    
        for (elem of res.filter(elem => elem[0] == 0 || elem[0] == 7)) //для каждого хода, который ведет на конец доски
            this.specialMoves.push(elem); //помним про превращение

        console.log(this.specialMoves.map(elem => coordToDesk(elem) ) );
        
        break;

    }

    // *здесь должна быть проверка для всех возможных ходов, что король не ставится под удар*

    return res;
}


function moveDirection( board, dir, Figure ) // идем по клеткам в направлении dir, пока не упремся
//dir - direction: [1,1]=вправо-вверх, [0,1]=направо и тд
{
    let res = [];
    let point = [];
    point[0] = Figure.coordinates[0]+dir[0];
    point[1] = Figure.coordinates[1]+dir[1];

    while (
        (0 <= point[0]  && point[0] < 8) && (0 <= point[1]  && point[1] < 8) && // не выходим за пределы доски
        ( board[point[0] ][point[1] ] [0] != Figure.color  ) // проверяемая клетка не занята своей фигурой
    )

        {
            res.push( [point[0], point[1] ] );
            if (board[point[0] ][point[1] ] [0] != '0' ) break; //врезались в противника, дальше не идем
            point[0] = point[0] + dir[0];  //почему нельзя чтобы [2,3] + [4,5] => [6,8]
            point[1] = point[1] + dir[1];
        }
    return res;
}


function ClearAll()
{
    clearPoints();
    let elements = document.querySelectorAll(".lastmove");
    for (elem of elements)
        elem.classList.remove("lastmove"); 
    for (let i = 0; i < 8; i++ )
        for (let j = 0; j < 8; j++ )
        {
            delete document.getElementById(coordToDesk([i,j]) ).figure;
        }
}


function defaultStage()
{
    ClearAll();
    mainBoard = [
        ['BR','BN','BB','BQ','BK','BB','BN','BR'],
        ['BP','BP','BP','BP','BP','BP','BP','BP'],
        ['0' ,'0' ,'0' ,'0' ,'0' ,'0' ,'0' ,'0' ],
        ['0' ,'0' ,'0' ,'0' ,'0' ,'0' ,'0' ,'0' ],
        ['0' ,'0' ,'0' ,'0' ,'0' ,'0' ,'0' ,'0' ],
        ['0' ,'0' ,'0' ,'0' ,'0' ,'0' ,'0' ,'0' ],
        ['WP','WP','WP','WP','WP','WP','WP','WP'],
        ['WR','WN','WB','WQ','WK','WB','WN','WR']
        ];

        for (let i = 0; i < 8; i++ )
            for (let j = 0; j < 8; j++ )
            {
                setFigure( [i,j], mainBoard[i][j] )
            }
    
    isTurnWhite = true;
    isFigureSelected = false;
}



//рисуем/убираем фигуры на доске (img.content)
function setFigure(coordinates, figure, newFig = '0' )  // передаем параметры фигуры, потом сам объект? передумать
{
    let cell_id = coordToDesk(coordinates);
    let cell = document.getElementById(cell_id);
    if (cell.figure == undefined) //когда начинаем партию, создаем новые объекты
        cell.figure = (figure!='0')? new Figure(coordinates, figure) : "0";
    else //когда переставляем, жонглируем старыми
        cell.figure = newFig;

    cell.firstElementChild.src = "images/" +  (figure != "0" ? figure : "void" ) + ".png";
    mainBoard[coordinates[0] ][coordinates[1] ] = figure;
}

//рисуем/убираем точки на доске (img.over)
function setPoint(coordinates, point) //point: true => point
{
    let cell_id = coordToDesk(coordinates);
    let cell = document.getElementById(cell_id);
    cell.lastElementChild.src = "images/" +  (point ? "point" : "void" ) + ".png";
    point ? pointedCells.push(coordinates) : pointedCells.shift();
}

function showLastMove(lastMove)
{
    let elements = document.querySelectorAll(".lastmove");
    for (elem of elements)
        elem.classList.remove("lastmove"); //переставем подсвечиать старый ход
    document.getElementById(coordToDesk(lastMove[0]) ).classList.add("lastmove");
    document.getElementById(coordToDesk(lastMove[1]) ).classList.add("lastmove");
}

function showMoves(fig)
{
    let zone = fig.getZone(mainBoard);
    
    for (cell of zone)
        {
            setPoint(cell, true);
        }
}

function clearPoints()
{
    let cellCoord 
    while (pointedCells.length > 0) 
        {
            cellCoord = pointedCells[0];
            setPoint(cellCoord, false);
        }
}

function coordToDesk(coordinates)// [0,0] => 'A8', [7,4] => 'E1'  
{
    let numToSymb = ['A','B','C','D','E','F','G','H'];
    return numToSymb[coordinates[1] ] +  (8-coordinates[0]);
}
/*  проверочное
console.log(coordToDesk([7,4]) )
console.log(deskToCoord("E1") )
*/
function deskToCoord(desk) // 'A8' => [0,0], 'E1' => [7,4]
{
    let numToSymb = ['A','B','C','D','E','F','G','H'];
    return [(8 - Number(desk[1]) ), numToSymb.findIndex(elem => elem == desk[0]) ]
}

function isEqual(arr1,arr2)
{
    return JSON.stringify(arr1) == JSON.stringify(arr2);
}


function clickOver(elem)
{
    let clickedCell = elem.parentNode;
    let isOppClicked = clickedCell.figure != '0'? ( (isTurnWhite && clickedCell.figure.color == 'B')||(!isTurnWhite && clickedCell.figure.color == 'W')  ): false;
    let isOwnClicked = clickedCell.figure != '0'? ( (isTurnWhite && clickedCell.figure.color == 'W')||(!isTurnWhite && clickedCell.figure.color == 'B')  ): false;
    
    if ( (clickedCell.figure == '0' || isOppClicked) && isFigureSelected && 
    pointedCells.some( (elem)=> 
    isEqual(elem, deskToCoord(clickedCell.id) ) ) )// нажатие на пустую отмеченную клетку, когда выбрана фигура
        {            
            console.log(`move ${coordToDesk(selectedFigure.coordinates) } => ${clickedCell.id} `);
            
            selectedFigure.move(deskToCoord(clickedCell.id) );
            isFigureSelected = false;
            selectedFigure = null;
            isTurnWhite = !isTurnWhite;
            clearPoints();


            console.log(`TURN ${isTurnWhite? 'WHITE' : 'BLACK' } NOW`);
        }

    if (isOwnClicked ) //нажали
        {       
            if (isFigureSelected)
                clearPoints();
            else isFigureSelected = true;

            selectedFigure = clickedCell.figure;
            showMoves(selectedFigure);

            //console.log(`${selectedFigure.color+selectedFigure.type} ${coordToDesk(selectedFigure.coordinates) }`);
        }
    /** / 
    console.log(`${isTurnWhite}  ${isFigureSelected} ${isOwnClicked} ${isOppClicked} 
    ${isFigureSelected? selectedFigure.color + selectedFigure.type : '0' } |
     ${clickedCell.figure} ${pointedCells.join('|')} 
     ${deskToCoord(clickedCell.id)} 
     ${pointedCells.some( ()=> deskToCoord(clickedCell.id) )}`);
    / **/

}

//main

colorCells();

let mainBoard = [
['0','0','0','0','0','0','0','0'],
['0','0','0','0','0','0','0','0'],
['0','0','0','0','0','0','0','0'],
['0','0','0','0','0','0','0','0'],
['0','0','0','0','0','0','0','0'],
['0','0','0','0','0','0','0','0'],
['0','0','0','0','0','0','0','0'],
['0','0','0','0','0','0','0','0']
];

let pointedCells = []; //клетки отмеченные точками; координаты [0-7,0-7]

let isTurnWhite = true;
let isFigureSelected = false;
let selectedFigure = Figure;
let lastMove = [Number,Number];
defaultStage();



