
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
    this.colortype = figure; //бывает нужно по отдельности, бывает полностью
    
    this.coordinates = coordinates;

    this.moved = false; //двигался ли с начала партии
    
    this.getZone = moveZone; //возвращает массив координат, куда может идти

    this.move = moveFigure; //перемещает фигуру

    this.specialMoves = []; //рокировка , взятие на проходе, превращение пешки
    //если фигура выделена, и есть ход, который ведет к перечисленному, он указан здесь
    return this;
}

function movePrognosis( fig, move  ) //каким будет положение фигур на доске, если передвинуть фигуру fig в координату move 
{
    let board = mainBoard.map( arr => arr.slice() ); //способ скопировать двумерный массив
    board[ fig.coordinates[0] ][ fig.coordinates[1] ] = '0'; //фигура уходит со своего места всегда
    board[ move[0] ][ move[1] ] = fig.colortype; //фигура куда-то переходит всегда

    if (fig.specialMoves.some( elem => isEqual(elem, move) )  ) //особенный ход
    {
        //превращение пешки нас не интересует, поэтому учитываем только
        if (fig.type == 'P' && [2,5].includes(move[0] ) ) //взятие на проходе
            { //съели пешку
                board[move[0] + ( (fig.color == 'W') ? 1 : -1)][move[1]] = '0';
            }
        //короткая рокировка
        if (fig.type == 'K' && move[1] == 6) 
            {
                board[move[0] ][7] = '0'; //убираем ладью
                board[move[0] ][5] = fig.color + 'R'; //ставим в новое положение
            }
        //длинная рокировка
        if (fig.type == 'K' && move[1] == 2) 
            {
                board[move[0] ][0] = '0'; //убираем ладью
                board[move[0] ][3] = fig.color + 'R'; //ставим в новое положение
            }
    }  
    return board;

}

function moveFigure(newCoord)
{

    if ( this.specialMoves.some( elem => isEqual(elem, newCoord) ) ) //особенный ход - вот здесь уже подумать
    {   
        if ( this.type == 'P' ) //пешка
        {
            if ([0,7].includes(newCoord[0] ) ) //превращение
                {
                    pawnTransformationStart(this); 
                }
            if ( [2,5].includes(newCoord[0]) ) //взятие на проходе
                {
                let eatenPawn = [newCoord[0] + ( (this.color == 'W') ? 1 : -1), newCoord[1] ];
                setFigure(eatenPawn, this); //костыль, чтобы не поломались списки оставшихся фигур
                setFigure(eatenPawn, '0'); //поставить фигуру и сразу же убрать
                }
        }

        if (this.type == 'K')
        { //не нравится обращение к документу, без него можно обойтись - надо переписать
            if ( newCoord[1] == 6)
                {
                    let rook = document.getElementById( coordToDesk([this.coordinates[0],7]) ).figure;
                    setFigure([this.coordinates[0],5], rook);
                    setFigure([this.coordinates[0],7] );
                    rook.moved = true;
                    rook.coordinates = [this.coordinates[0],5];
                }
            if ( newCoord[1] == 2)
                {
                    let rook = document.getElementById( coordToDesk([this.coordinates[0],0]) ).figure;
                    setFigure([this.coordinates[0],3], rook);
                    setFigure([this.coordinates[0],0] );
                    rook.moved = true;
                    rook.coordinates = [this.coordinates[0],3];

                }

        }
    }

    setFigure(this.coordinates); //оставляем после себя пустое место
    setFigure(newCoord, this); //ставим фигуру на новое

    lastMove = [this.coordinates, newCoord]; //запоминаем ход
    showLastMove(lastMove);  //чтобы его обозначить (не только)

    this.coordinates = newCoord;
    this.moved = true;

}

// возвращает массив координат возможных ходов для фигур на доске
function moveZone(board) 
{
    let directions;
    let res = [];
    this.specialMoves = [];
    switch (this.type)
    {
    case 'R': //ладья
        directions = [ [-1,0], [1,0], [0,-1], [0,1] ];
        for (let dir of directions)    
            for (cell of moveDirection(board, dir, this) )
                res.push(cell);
        break;

    case 'N': //конь
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
                    { res.push( [i,j] ); }
        break;

    case 'B': //офицер
        directions = [ [-1,-1], [-1,1], [1,-1], [1,1] ];
        for (let dir of directions)    
            for (cell of moveDirection(board, dir, this) )
                res.push(cell);
        break;

    case 'Q': //королева
        directions = [ [-1,-1], [-1,1], [1,-1], [1,1], [-1,0], [1,0], [0,-1], [0,1] ];
        for (let dir of directions)    
            for (cell of moveDirection(board, dir, this) )
                res.push(cell);
        break;

    case 'K': //король
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
            !document.getElementById( coordToDesk( [this.coordinates[0],0] ) ).figure.moved //и ладья не двигалась 
            )// на последнюю строчку смотреть несколько неприятно. можно обойтись без обращения к документу, надо переписать
            {
            this.specialMoves.push( [this.coordinates[0], 2] );
            res.push( [this.coordinates[0], 2] );
            }
        break;

    case 'P':
        let dir = this.color == "W" ? -1 : 1; //в какую сторону перед
        if ( [-1,8].includes( this.coordinates[0] + dir) )
            break;

        if ( board[ this.coordinates[0] + dir][this.coordinates[1]] == '0' ) 
                res.push( [this.coordinates[0] + dir,this.coordinates[1]] ); //вперед

        if (!this.moved && board[ this.coordinates[0] + 2*dir][this.coordinates[1]] == '0' && board[ this.coordinates[0] + dir][this.coordinates[1]] == '0' )
            res.push( [this.coordinates[0] + 2*dir,this.coordinates[1]] ); //дважды вперед, если не двигались

        /**/ 
        if ( this.coordinates[1] != 0 && ![this.color, '0'].includes( board[ this.coordinates[0] + dir][this.coordinates[1]-1] [0] ) )
            res.push( [this.coordinates[0] + dir,this.coordinates[1]-1] ); //слева враг
        if ( this.coordinates[1] != 7 && ![this.color, '0'].includes(  board[ this.coordinates[0] + dir][this.coordinates[1]+1] [0] )  )
            res.push( [this.coordinates[0] + dir,this.coordinates[1]+1] ); //справа враг
        /**/
        // проверка на взятие на проходе
        if (lastMove != undefined)
        {
            if  (isEqual( lastMove[0], [this.coordinates[0] + 2*dir,this.coordinates[1]-1]) && //стоял слева - 2х спереди
                 isEqual( lastMove[1], [this.coordinates[0], this.coordinates[1]-1]) &&  //теперь стоит строго слева
                 board[ this.coordinates[0] ][this.coordinates[1]-1] [0] != this.color && //фигура оппонента, возможно лишнее(как-бы само собой, ходы же по очереди)
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

        // проверка на превращение    
        for (elem of res.filter(elem => elem[0] == 0 || elem[0] == 7)) //для каждого хода, который ведет на конец доски
            this.specialMoves.push(elem); //превращение
        break;
    }

    //проверка для всех найденных ходов, что король не ставится под удар
    if (board === mainBoard) //проверку на атаку короля проводить только для явных ходов, чтобы не скатиться в рекурсию
    {
    res = res.filter(elem => { return !isKingAttacked(movePrognosis(this, elem), this.color) } );
    
    // проверка на то, что при рокировке король не становится под удар
    if (this.type == 'K' && this.specialMoves.length != 0) 
        { 
        if (!( //длинная рокировка
            ( this.specialMoves.some(el => isEqual(el, [this.coordinates[0], 2]) ) ) && //подтверждение, что особый ход
            ( res.some(el => isEqual(el, [this.coordinates[0], 3]) ) ) //клетка которую перепрыгивает король - возможный ход
        ) )
            {
                res = res.filter(el => !isEqual(el, [this.coordinates[0], 2] ) ); //так проще чем просто удалить из массива. ...сюр какой-то
            }

        if (!( //короткая рокировка
            ( this.specialMoves.some(el => isEqual(el, [this.coordinates[0], 6]) ) ) &&
            ( res.some(el => isEqual(el, [this.coordinates[0], 5]) ) )  
        ) )
            {
                res = res.filter(el => !isEqual(el, [this.coordinates[0], 6] ) );
            }
        }
    }

    return res;
}

function pawnTransformationStart(pawn)
{
    var dialog = document.querySelector('dialog');
    dialog.figure = pawn;
    dialog.showModal();
}
function pawnTransformationEnd(id)
{
    var dialog = document.querySelector('dialog');  
    pawn = dialog.figure;
    pawn.type = id;
    pawn.colortype = pawn.color + id;
    console.log(pawn);
    setFigure(pawn.coordinates, pawn);
    console.log(pawn);
    dialog.close();
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
            point[0] = point[0] + dir[0];  //почему нельзя чтобы [2,3] + [4,5] == [6,8]
            point[1] = point[1] + dir[1];
        }
    return res;
}


//фигня в том, что от board мало что зависит, а должно зависеть всё
function isKingAttacked(board, color) //атакован ли король цвета color
{
    let king = null; 
    let list = [];
    res = false;
    
    if  (board === mainBoard) //текущий ход
    {
        
    king = getFigureList(color).find(elem => elem.type == 'K' )//ищем координаты короля
    list = getFigureList( getOppositeColor(color) ) //список вражеских фигур
        
    for (elem of list) //для каждой вражеской фигуры 
    { // смотрим куда они могут походить и сравниваем с координатами короля
        if  (elem.getZone(board).find(arrelem => isEqual(arrelem, king.coordinates) ) != undefined  ) 
        { //нашли => король под атакой
            return true;
        }
    }
    return false;
    }

    else //прогнозируемый ход для предотвращения недопустимого хода - чтобы король не оказался под ударом
    { //есть расхождения с реальной доской => кто-то из фигур может быть съеден или передвинут
        //проблема в том, что для getzone нужна фигура, а координаты у фигур менять нельзя (в фигурах заложено положение фигур на главной доске)
        //с фигурами оппонента достаточно просто - убедиться что фигура все еще на доске и получить зону атаки
        //со своими фигурами - не найдет фигуру которую в результате хода перемещаешь
        //таким образом не получается спрогнозировать, что ход приведёт к шаху/мату - только по факту совершенного хода
        
        //знаю что неправильно, а как правильно?

        //сначала составляем список фигур оппонента
        let oppList = getFigureList( getOppositeColor(color) ) 
        for (let i = 0; i < 8; i++ )
            for (let j = 0; j < 8; j++)
                {
                    if (board[i][j] == color + 'K' ) //свой король - запоминаем координаты
                        king = [i,j];
                    
                    if (board[i][j][0] == ( getOppositeColor(color) ) ) //фигура оппонента - добавляем в список
                    {
                       let enemFig = oppList.find(elem => 
                        elem.colortype == board[i][j] && (isEqual(elem.coordinates, [i,j]) ) );
                        if (enemFig != undefined) list.push( enemFig );   //добавляем фигуру
                    }
                } 

        // запускаем от всех врагов getzone
        for (elem of list) //для каждой вражеской фигуры 
        {
            if  (elem.getZone(board).find(arrelem => isEqual(arrelem, king)  ) != undefined  ) // смотрим куда они могут походить и сравниваем с координатами короля
            {
                return true;
            }
        }
        return false;
    }   
}

//есть ли ходы у игрока цвета col
// isStalemate &&  isKingAttacked => мат
// isStalemate && !isKingAttacked => пат   
function isStalemate(col)
{
    let list = getFigureList(col);
    
    for (el of list)
    {
        if (el.getZone(mainBoard).length != 0) //у какой-либо фигуры есть ход
            {//console.log( el.colortype , el.getZone(mainBoard).join('|') );
                return false;
            }
    }
    return true;
}


function ClearAll()
{
    clearPoints();

    WhiteFigures = [];
    BlackFigures = [];

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
                if (mainBoard[i][j] != '0')
                {
                    let fig =  new Figure([i,j], mainBoard[i][j]);
                    getFigureList(mainBoard[i][j][0]).push(fig);
                    setFigure( [i,j], fig );
                }
                else 
                    setFigure( [i,j] );
            }
    
    isTurnWhite = true;
    isFigureSelected = false;
}



//рисуем/убираем фигуры на доске (img.content)
//...есть лишняя логика
//по идее должна быть только прорисовка на доске 
function setFigure(coordinates, newFig = '0' )  // передаем параметры фигуры, потом сам объект? передумать
{
    let cell_id = coordToDesk(coordinates);
    let cell = document.getElementById(cell_id);

     //считаем, что если newFig не определено, то это "уборка" фигуры после перемещения
    if (cell.figure!= undefined && cell.figure != "0" && newFig !='0' ) //взята фигура - удаляем из списка
        deleteFromArray(getFigureList(cell.figure.color), cell.figure);

    mainBoard[coordinates[0] ][coordinates[1] ] =  newFig != "0" ? newFig.colortype : "0" ;
    cell.figure = newFig;
    cell.firstElementChild.src = "images/" +  (newFig != "0" ? newFig.colortype : "void" ) + ".png";
}

//рисуем/убираем точки на доске (img.over)
function setPoint(coordinates, point) //point: true => point
{
    let cell_id = coordToDesk(coordinates);
    let cell = document.getElementById(cell_id);
    cell.lastElementChild.src = "images/" +  (point ? "point" : "void" ) + ".png";
    point ? pointedCells.push(coordinates) : pointedCells.shift();
}

//показать последний ход
function showLastMove(lastMove)
{
    let elements = document.querySelectorAll(".lastmove");
    for (elem of elements)
        elem.classList.remove("lastmove"); //переставем подсвечиать старый ход
    
    //подсвечиваем новый
    document.getElementById(coordToDesk(lastMove[0]) ).classList.add("lastmove");
    document.getElementById(coordToDesk(lastMove[1]) ).classList.add("lastmove");
}

function showMoves(fig)
{
    let zone = fig.getZone(mainBoard);
    
    for (let cell of zone)
        { setPoint(cell, true); }
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

// вспомогательное 
function coordToDesk(coordinates)// [0,0] => 'A8', [7,4] => 'E1'  
{
    let numToSymb = ['A','B','C','D','E','F','G','H'];
    return numToSymb[coordinates[1] ] +  (8-coordinates[0]);
}
function deskToCoord(desk) // 'A8' => [0,0], 'E1' => [7,4]
{
    let numToSymb = ['A','B','C','D','E','F','G','H'];
    return [(8 - Number(desk[1]) ), numToSymb.findIndex(elem => elem == desk[0]) ]
}

function isEqual(arr1,arr2)
{
    return JSON.stringify(arr1) == JSON.stringify(arr2);
}

function deleteFromArray(arr, elem)
{ //достаточно криво
    let index = arr.findIndex( arrElem => isEqual(arrElem,elem) );
    arr.splice( index, 1 );
}

function getFigureList(color)
{
    return color == "W" ? WhiteFigures : (color == "B" ? BlackFigures : '0' ); 
}
function getOppositeColor(color)
{
    return color == 'W' ? 'B' : (color == 'B' ? 'W' : null);
}

//

function clickOver(elem)
{
    let clickedCell = elem.parentNode;
    let isOppClicked = clickedCell.figure != '0'? ( (isTurnWhite && clickedCell.figure.color == 'B')||(!isTurnWhite && clickedCell.figure.color == 'W')  ): false;
    let isOwnClicked = clickedCell.figure != '0'? ( (isTurnWhite && clickedCell.figure.color == 'W')||(!isTurnWhite && clickedCell.figure.color == 'B')  ): false;
    
    if ( (clickedCell.figure == '0' || isOppClicked) && isFigureSelected && 
    pointedCells.some( (elem)=> 
    isEqual(elem, deskToCoord(clickedCell.id) ) ) )// нажатие на пустую отмеченную клетку, когда выбрана фигура
        {    
            /**/   
            console.log(`move ${coordToDesk(selectedFigure.coordinates) } => ${clickedCell.id} `);
            console.log(`TURN ${!isTurnWhite? 'WHITE' : 'BLACK' } NOW`);
            /**/ 

            selectedFigure.move(deskToCoord(clickedCell.id) );
            isFigureSelected = false;
            selectedFigure = null;
            isTurnWhite = !isTurnWhite;
            clearPoints();


            let color = isTurnWhite ? 'W' : 'B';
            /**/
            console.log(`W checked = ${isKingAttacked(mainBoard, "W")}, stalemate = ${isStalemate(color)}`);
            console.log(`B checked = ${isKingAttacked(mainBoard, "B")}, stalemate = ${isStalemate(color)}`);
            /**/

            if (isStalemate(color) && isKingAttacked(mainBoard, color) ) //мат игроку color
                alert(`Игрок ${getOppositeColor(color)} победил - МАТ`);
            else if (isStalemate(color) && isKingAttacked(mainBoard, color) ) //пат игроку color
                alert(`У игрока ${color} нет ходов и король не атакован - ПАТ`);
        
            }

    if (isOwnClicked ) //нажали на свою фигуру
        {       
            if (isFigureSelected)
                clearPoints();
            else isFigureSelected = true;

            selectedFigure = clickedCell.figure;
            showMoves(selectedFigure);
        }

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

let WhiteFigures = [ ];
let BlackFigures = [ ];

let isTurnWhite = true;
let isFigureSelected = false;
let selectedFigure = Figure;
let lastMove = [Number,Number];
defaultStage();
