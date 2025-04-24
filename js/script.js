/* ---------- DOM‑ссылки ---------- */
const localization_content   = document.getElementById("localization-content");
const initialJson            = document.getElementById("initial-json");
const localization_start     = document.getElementById("localization-start");
const localCopyOfinitialJson = document.getElementById("initial-json");
const contentArea            = document.querySelector("#final-json-area");
const templateFinalJson      = document.querySelector("#template-final-json-area");
const checkInitialTags       = document.querySelector("#initial-json-tags");
const notifyBox              = document.getElementById("notify");

/* ---------- переменные ---------- */
let updatedLocalCopy = [];
let finalJsonCount   = 0;

/* ---------- служебные функции ---------- */
const showNotify = (msg, type='ok')=>{
  notifyBox.textContent = msg;
  notifyBox.className = `notify ${type}`;
  setTimeout(()=>notifyBox.classList.add('hidden'), 4000);
  requestAnimationFrame(()=>notifyBox.classList.remove('hidden'));
};

/* ---------- обработка таблицы ---------- */
function getENGLocalizationText(content) {
  const lines = [...content.getElementsByTagName("tr")];
  return clearLocalizationText({lines, column:0, shield:false});
}

function getNONENGLocalizationText(content) {
  const result       = [];
  const lines        = [...content.getElementsByTagName("tr")];
  const countColumns = lines[0].getElementsByTagName("td").length;
  finalJsonCount     = countColumns - 1;

  for (let i=1; i<countColumns; i++){
    result.push( clearLocalizationText({lines, column:i, shield:true}) );
  }
  return result;
}

function clearLocalizationText({lines, column=0, shield=false}) {
  return lines.map(line=>{
    let txt = line.getElementsByTagName("td")[column].innerText
                 .replace(/\n|\r/g,"")
                 .replace(/\u00a0/g," ")
                 .replace(/\s+/g," ")
                 .replace("• ","");
    if(shield) txt = txt.replaceAll('"','\\"');
    return [txt];
  });
}

/* ---------- обновление JSON ---------- */
function updateLocalCopy() {
  updatedLocalCopy    = [];
  const tableENG      = getENGLocalizationText(localization_content);
  const tableNONENG   = getNONENGLocalizationText(localization_content);

  tableNONENG.forEach(column=>{
    const textToUpdate = localCopyOfinitialJson.innerText.split("\n");

    tableENG.forEach((values,rowIdx)=>{
      const oldLine = values;
      const newLine = column[rowIdx];

      textToUpdate.forEach((line,lineIdx)=>{
        const [key,rawVal] = line.split('": "');
        if(!rawVal) return;

        let value = rawVal.replace(/&nbsp;/g," ").replace(/\u00a0/g," ");
        if(checkInitialTags.checked) value = value.replace(/<.*?>/g,"");

        if(value.includes(oldLine, newLine)){
          textToUpdate[lineIdx] = `${key}": "${value.replace(oldLine,newLine)}`;
        }
      });
    });
    updatedLocalCopy.push(textToUpdate);
  });
}

/* ---------- генерация интерфейса ---------- */
function createNewJsonIntoArea() {
  contentArea.querySelectorAll("div").forEach(el=>el.remove());
  for(let i=0;i<finalJsonCount;i++){
    const template = templateFinalJson.content.cloneNode(true);
    const div      = template.querySelector(".json-area__field");
    template.querySelector(".area-label").innerText = `Component Updated Code (.json) - ${i+1}`;
    div.id = `final-json-${i}`;
    contentArea.appendChild(template);
  }
}

function insertNewJsonIntoArea() {
  for(let i=0;i<finalJsonCount;i++){
    const final_json = document.querySelector(`#final-json-${i}`);
    final_json.innerHTML = "";

    updatedLocalCopy[i].forEach(codeline=>{
      const div = document.createElement("div");
      div.className = "row";

      if(codeline.includes(":")){
        const idx        = codeline.indexOf(":");
        const redLine    = codeline.slice(0,idx);
        const blueLine   = codeline.slice(idx+1);

        const spanRed  = Object.assign(document.createElement("span"), {className:"redLine",  innerText:redLine});
        const spanBlue = Object.assign(document.createElement("span"), {className:"blueLine", innerText:blueLine});

        div.append(spanRed, ":");
        div.appendChild(spanBlue);
      } else {
        div.innerText = codeline;
      }
      final_json.appendChild(div);
    });
  }
}

function compareBeforeAndAfter() {
  const initial_lines = localCopyOfinitialJson.innerText.split("\n");
  for(let i=0;i<finalJsonCount;i++){
    const final_json = document.querySelector(`#final-json-${i}`);
    final_json.childNodes.forEach(line=>line.classList.remove("updated"));
    initial_lines.forEach((line,idx)=>{
      if(line !== final_json.childNodes[idx]?.innerText){
        final_json.childNodes[idx].classList.add("updated");
      }
    });
  }
}

/* ---------- запуск процесса с уведомлением ---------- */
localization_start.onclick = ()=>{
  try{
    updateLocalCopy();
    createNewJsonIntoArea();
    insertNewJsonIntoArea();
    compareBeforeAndAfter();
    showNotify("✔ Complited","ok");
  }catch(err){
    console.error(err);
    showNotify(`✖ Error: ${err.message}`,"error");
  }
};

/* ---------- очистка форматирования при вставке ---------- */
document.querySelectorAll(".ignore-styles-1").forEach(block=>{
  block.addEventListener("paste", e=>{
    e.preventDefault();
    document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
  });
});
