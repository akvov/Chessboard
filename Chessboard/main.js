
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

function defaultStage()
{
    mainBoard = [
        ['BR','BN','BB','BQ','BK','BB','BN','BR'],
        ['BP','BP','BP','BP','BP','BP','BP','BP'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['WP','WP','WP','WP','WP','WP','WP','WP'],
        ['WR','WN','WB','WQ','WK','WB','WN','WR']
        ];

        for (let i = 0; i < 8; i++ )
            for (let j = 0; j < 8; j++ )
            {
                setFigure( [j,i], mainBoard[i][j] )
            }
}



//рисуем/убираем фигуры на доске (img.content)
function setFigure(coordinates, figure) 
{
    let cell_id = coordToDesk(coordinates);
    let cell = document.getElementById(cell_id);
    cell.figure = figure
    cell.firstElementChild.src = "images/" +  (figure != "0" ? figure : "void" ) + ".png";
 
}

//рисуем/убираем точки на доске (img.over)
function setPoint(coordinates, point) //point: true => point
{
    let cell_id = coordToDesk(coordinates);
    let cell = document.getElementById(cell_id);
    cell.lastElementChild.src = "images/" +  (point ? "point" : "void" ) + ".png";
    point ? pointedCells.push(coordinates) : pointedCells.shift();
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
    return numToSymb[coordinates[0] ] +  (8-coordinates[1]);
}
function deskToCoord(desk) //a8,h1 => 00,77
{
    let numToSymb = ['A','B','C','D','E','F','G','H'];
    return [numToSymb.findIndex(elem => elem == desk[0]) , (8 - Number(desk[1]) ) ]
}



function clickOver(elem)
{
    console.log("over " + elem.parentNode.id + ' ' + elem.parentNode.figure);
    setPoint(deskToCoord(elem.parentNode.id), true);
}

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