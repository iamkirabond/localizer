let localization_content = document.getElementById("localization-content");
let initialJson = document.getElementById("initial-json");
let localization_start = document.getElementById("localization-start");
let localCopyOfinitialJson = document.getElementById("initial-json");
let contentArea = document.querySelector("#final-json-area");
let templateFinalJson = document.querySelector("#template-final-json-area");
let checkInitialTags = document.querySelector("#initial-json-tags");

let updatedLocalCopy = [];
let finalJsonCount = 0;

function getENGLocalizationText(content) {
  let lines = [].slice.call(content.getElementsByTagName("tr"));
  let clearedTDText = clearLocalizationText({ lines: lines, column: 0, shield: false });
  return clearedTDText;
}

function getNONENGLocalizationText(content) {
  let result = [];
  let lines = [].slice.call(content.getElementsByTagName("tr"));
  let countColumns = lines[0].getElementsByTagName("td").length;
  finalJsonCount = countColumns - 1;
  for (let i = 1; i < countColumns; i++) {
    let clearedTDText = clearLocalizationText({ lines: lines, column: i, shield: true });
    result.push(clearedTDText);
  }
  return result;
}

function clearLocalizationText({ lines, column = 0, shield = false }) {
  let arr = [];
  lines.forEach((line) => {
    let arrItem = [
      line
        .getElementsByTagName("td")
        [column].innerText.replace(/\n|\r/g, "")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .split(" ")
        .join(" ")
        .replace("• ", ""),
    ];
    if (shield === true) {
      arrItem[0] = arrItem[0].replaceAll('"', '\\"')    
    }
    arr.push(arrItem);
  });
  return arr;
}

function updateLocalCopy() {
  updatedLocalCopy = [];
  let tableContentENG = getENGLocalizationText(localization_content);
  let tableContentNONENG = getNONENGLocalizationText(localization_content);
  console.log(tableContentENG);
  console.log(tableContentNONENG);

  tableContentNONENG.forEach((column) => {
    let textToUpdate = localCopyOfinitialJson.innerText.split("\n");

    tableContentENG.forEach((values, index) => {
      let oldLine = values;
      let newLine = column[index];

      textToUpdate.forEach((line, index) => {
        let key = line.split('": "')[0];
        let value = line.split('": "')[1];
        if (value) {
          value = value.replace(/&nbsp;/g, " ").replace(/\u00a0/g, " ");
          if (checkInitialTags.checked === true) {
            value = value.replace(/<.*?>/g, "");
          }
          if (value.includes(oldLine, newLine)) {
            textToUpdate[index] =
              key + '": "' + value.replace(oldLine, newLine);
          }
        }
      });
    });
    updatedLocalCopy.push(textToUpdate);
  });
}

function createNewJsonIntoArea() {
  contentArea.querySelectorAll("div").forEach((child) => child.remove());
  for (let i = 0; i < finalJsonCount; i++) {
    let template = templateFinalJson.content.cloneNode(true);
    let div = template.querySelector(".json-area__field");
    div.id = `final-json-${i}`;
    contentArea.appendChild(template);
  }
}

function insertNewJsonIntoArea() {
  for (let i = 0; i < finalJsonCount; i++) {
    let final_json = document.querySelector(`#final-json-${i}`);
    final_json.innerHTML = "";
    updatedLocalCopy[i].forEach((codeline) => {
      const div = document.createElement("div");

      div.className = "row";

      if (codeline.includes(":")) {
        var index = codeline.indexOf(":");
        var breakline = [codeline.slice(0, index), codeline.slice(index + 1)];
        let redLine = breakline[0];
        let blueLine = breakline[1];

        let spanRed = document.createElement("span");
        spanRed.classList.add("redLine");
        spanRed.innerText = redLine;

        let spanBlue = document.createElement("span");
        spanBlue.classList.add("blueLine");
        spanBlue.innerText = blueLine;

        div.appendChild(spanRed);
        div.innerHTML += ":";
        div.appendChild(spanBlue);
      } else {
        div.innerText = `${codeline}`;
      }

      final_json.appendChild(div);
    });
  }
}

function compareBeforeAndAfter() {
  let initial_lines = localCopyOfinitialJson.innerText.split("\n");
  for (let i = 0; i < finalJsonCount; i++) {
    let final_json = document.querySelector(`#final-json-${i}`);
    final_json.childNodes.forEach((line) => {
      line.classList.remove("updated");
    });
    initial_lines.forEach((line, index) => {
      if (line != final_json.childNodes[index].innerText) {
        final_json.childNodes[index].classList.add("updated");
      }
    });
  }
}

localization_start.onclick = function () {
  updateLocalCopy();
  createNewJsonIntoArea();
  insertNewJsonIntoArea();
  compareBeforeAndAfter();
};

// window.onclick = function() {
//     if(initialJson.innerText.length > 0 && localization_content.innerText.length > 0){
//         initValues()
//         compareBeforeAndAfter()
//     }
// }

var ce = document.querySelectorAll(".ignore-styles-1");
ce.forEach((block) =>
  block.addEventListener("paste", function (e) {
    e.preventDefault();
    var text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  })
);
