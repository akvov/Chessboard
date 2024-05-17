
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
    
    this.zone = MoveZone(mainBoard, this);
    //this.move = function(){};
    return this;
}

function MoveZone(board, Figure) // возвращает массив координат возможных ходов для фигур на доске
{
    let res = [];
    switch (Figure.type)
    {
    case 'R': 
        for (cell of moveDirection(board, [-1,0], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [1,0], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [0,-1], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [0,1], Figure) )
            res.push( cell );
        break;
    case 'N':
        for (let i = 0; i < 8; i++ )
            for (let j = 0; j < 8; j++ )
                if (
                    (
                    ( (Figure.coordinates[0] == i+2) || (Figure.coordinates[0] == i-2) ) ? 
                       ( ( (Figure.coordinates[1] == j+1)||(Figure.coordinates[1]==j-1)  )? true : false) :
                       ( (Figure.coordinates[0] == i+1) || (Figure.coordinates[0] == i-1) )?
                       ( ( (Figure.coordinates[1] == j+2)||(Figure.coordinates[1]==j-2)  )? true : false) : false
                    ) && ( board[i][j] [0] != Figure.color )
                    )
                    {
                    res.push( [i,j] );
                    }
        break;
    case 'B':
        for (cell of moveDirection(board, [-1,-1], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [-1,1], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [1,-1], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [1,1], Figure) )
            res.push( cell );
        break;
    case 'Q':
        for (cell of moveDirection(board, [-1,-1], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [-1,1], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [1,-1], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [1,1], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [-1,0], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [1,0], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [0,-1], Figure) )
            res.push( cell );
        for (cell of moveDirection(board, [0,1], Figure) )
            res.push( cell );
        break;
    case 'K':
        
        for (let i = 0; i < 8; i++ )
            for (let j = 0; j < 8; j++ )
            
                if ( 
                    ( 
                    (Figure.coordinates[0]==i)||
                    (Figure.coordinates[0]==i+1)||
                    (Figure.coordinates[0]==i-1) 
                    ) && (
                    (Figure.coordinates[1]==j)||
                    (Figure.coordinates[1]==j+1)||
                    (Figure.coordinates[1]==j-1)                 
                    ) && ( 
                    JSON.stringify(Figure.coordinates) != JSON.stringify([i,j]) //сами в себя не ходим
                    ) && (
                    board[i][j][0] != Figure.color ) //не ходим в своих
                )
            {

            res.push( [i,j] );
            }

        // *здесь должны быть проверки на рокировки*

        break;
    case 'P':

        let dir = Figure.color == "W" ? -1 : 1; 
        
        if ( board[ Figure.coordinates[0] + dir][Figure.coordinates[1]] == '0' )
                res.push( [Figure.coordinates[0] + dir,Figure.coordinates[1]] );
        if ( board[ Figure.coordinates[0] + 2*dir][Figure.coordinates[1]] == '0' && !Figure.moved)
            res.push( [Figure.coordinates[0] + 2*dir,Figure.coordinates[1]] );

        if ( Figure.coordinates[1] != 0 && ![Figure.color, '0'].includes( board[ Figure.coordinates[0] + dir][Figure.coordinates[1]-1] [0] ) )
            res.push( [Figure.coordinates[0] + dir,Figure.coordinates[1]-1] );
        if ( Figure.coordinates[1] != 7 && ![Figure.color, '0'].includes(  board[ Figure.coordinates[0] + dir][Figure.coordinates[1]+1] [0] )  )
            res.push( [Figure.coordinates[0] + dir,Figure.coordinates[1]+1] );

        // *здесь должна быть проверка на взятие на проходе* 
        // *проверку на превращение лучше наверное запихать в передвижение*

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
            point[0] = point[0] + dir[0];
            point[1] = point[1] + dir[1];
        }
    return res;
}



function defaultStage()
{
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

    setFigure( deskToCoord("E4"), "WQ" )
    setFigure( deskToCoord("D6"), "WP" )
}



//рисуем/убираем фигуры на доске (img.content)
function setFigure(coordinates, figure) 
{
    let cell_id = coordToDesk(coordinates);
    let cell = document.getElementById(cell_id);
    cell.figure = (figure!='0')? new Figure(coordinates, figure) : 0;
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

function showMoves(Figure)
{
    let zone = MoveZone(mainBoard, Figure);
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

function coordToDesk(coordinates)// 00,77 => a8,h1  
{
    let numToSymb = ['A','B','C','D','E','F','G','H'];
    return numToSymb[coordinates[1] ] +  (8-coordinates[0]);
}
/*
console.log(coordToDesk([7,4]) )
console.log(deskToCoord("E1") )
*/
function deskToCoord(desk) //a8,h1 => 00,77
{
    let numToSymb = ['A','B','C','D','E','F','G','H'];
    return [(8 - Number(desk[1]) ), numToSymb.findIndex(elem => elem == desk[0]) ]
}



function clickOver(elem)
{
    console.log("over " + elem.parentNode.id + ' ' + elem.parentNode.figure.zone.map(cell=>coordToDesk(cell) ).join(' ')  );
    //setPoint(deskToCoord(elem.parentNode.id), true);
    clearPoints();
    showMoves(elem.parentNode.figure) ;
}


//main

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

colorCells();

//setFigure([4,7], "WK" )
//setFigure([4,7], "0")
//defaultStage();

