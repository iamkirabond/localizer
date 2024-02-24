let localization_content = document.getElementById("localization-content")
let initialJson = document.getElementById("initial-json")
let localization_start = document.getElementById("localization-start")
let localCopyOfinitialJson = document.getElementById("initial-json")
let final_json = document.getElementById("final-json")


let tableContent = []
let textToUpdate = []


function getLocalizationText(){
    let lines = [].slice.call(localization_content.getElementsByTagName("tr"))

    lines.forEach(line =>{
        let arr = []
        
        if (line.getElementsByTagName("td")[0]){
            arr = [
                line.getElementsByTagName("td")[0].innerText.replace(/\n|\r/g, "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").split(" ").join(" ").replace("• ", ""),
                line.getElementsByTagName("td")[1].innerText.replace(/\n|\r/g, "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").split(" ").join(" ").replace("• ", "")
            ]

            if (arr[0].length > 0){
                tableContent.push(arr)
            } 
        }
          
    })

    tableContent.sort(function(a, b){
        return b[0].length - a[0].length;
    });

    console.log(tableContent)
}


function updateLocalCopy(){
    textToUpdate = localCopyOfinitialJson.innerText.split('\n')

    tableContent.forEach((values) => {
        let oldLine = values[0]
        let newLine = values[1]

        textToUpdate.forEach((line, index) => {
            line = line.replace(/\u00a0/g, " ")
            if (line.includes(oldLine, newLine)){
                textToUpdate[index] = line.replace(oldLine, newLine)
            }
        })
    })
}

function insertNewJsonIntoArea() {
    final_json.innerHTML = ''
    textToUpdate.forEach(codeline => {
        const div = document.createElement('div');

        div.className = 'row';

        if (codeline.includes(":")){

            var index = codeline.indexOf(':');
            var breakline = [codeline.slice(0, index), codeline.slice(index + 1)];
            let redLine = breakline[0]
            let blueLine = breakline[1]

            let spanRed = document.createElement('span')
            spanRed.classList.add('redLine')
            spanRed.innerText = redLine

            let spanBlue = document.createElement('span')
            spanBlue.classList.add('blueLine')
            spanBlue.innerText = blueLine

            div.appendChild(spanRed)
            div.innerHTML += ':'
            div.appendChild(spanBlue)
        }
        else{
            div.innerText = `${codeline}`
        }
        
        final_json.appendChild(div);
    });
}

function initValues(){
    localization_content = document.getElementById("localization-content")
    initialJson = document.getElementById("initial-json")
    localization_start = document.getElementById("localization-start")
    localCopyOfinitialJson = document.getElementById("initial-json")
    final_json = document.getElementById("final-json")

    tableContent = []
    textToUpdate = []
}

function compareBeforeAndAfter(){
    let initial_lines = localCopyOfinitialJson.innerText.split('\n')

    final_json.childNodes.forEach((line) =>{
        line.classList.remove('updated')
    })
    initial_lines.forEach((line, index) => {
        if(line != final_json.childNodes[index].innerText){ 
            final_json.childNodes[index].classList.add('updated')            
        }    
    })
}


localization_start.onclick = function() {
    initValues()
    getLocalizationText()
    updateLocalCopy()
    insertNewJsonIntoArea()
    compareBeforeAndAfter()
}

window.onclick = function() {
    if(initialJson.innerText.length > 0 && localization_content.innerText.length > 0){
        initValues()
        compareBeforeAndAfter()
    }
}

var ce = document.querySelectorAll('.ignore-styles-1')
ce.forEach(block => block.addEventListener('paste', function (e) {
  e.preventDefault()
  var text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}))
