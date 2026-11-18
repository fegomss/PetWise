const RECORDS_KEY = "petwise-fichas";
const recordGrid = document.querySelector("#record-grid");
const registrationForm = document.querySelector("#registration-form");
const formMessage = document.querySelector("#form-message");
const recordSelect = document.querySelector("#record-select");
const savedRecordsList = document.querySelector("#saved-records-list");
let exampleRecord = null;
let records = [];

function createId() { return crypto.randomUUID(); }
function text(value) { return typeof value === "string" && value.trim() ? value.trim() : "Não informado"; }

function readRecords() {
    try {
        const stored = JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]");
        return Array.isArray(stored) ? stored : [];
    } catch (error) {
        console.error("Não foi possível ler os cadastros.", error);
        return [];
    }
}

function saveRecords() { localStorage.setItem(RECORDS_KEY, JSON.stringify(records)); }

function formatDate(value) {
    if (!value || value === "Não informado") return "Não informado";
    const [year, month, day] = value.split("-");
    return year && month && day ? `${day}/${month}/${year}` : value;
}

function renderRecord(record) {
    if (!recordGrid || !record) return;
    const fragment = document.createDocumentFragment();
    for (const [groupName, fields] of Object.entries(record)) {
        if (!["Cliente", "Animal", "Atendimento"].includes(groupName)) continue;
        const card = document.createElement("article");
        card.className = "record-card";
        const heading = document.createElement("h3");
        heading.textContent = groupName;
        const fieldList = document.createElement("dl");
        fieldList.className = "record-fields";
        for (const [label, value] of Object.entries(fields)) {
            const field = document.createElement("div");
            field.className = "record-field";
            const term = document.createElement("dt");
            term.textContent = label;
            const description = document.createElement("dd");
            description.textContent = text(value);
            field.append(term, description);
            fieldList.append(field);
        }
        card.append(heading, fieldList);
        fragment.append(card);
    }
    recordGrid.replaceChildren(fragment);
}

function renderSavedRecords() {
    recordSelect.replaceChildren();
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = records.length ? "Selecione uma ficha" : "Nenhum cadastro salvo";
    recordSelect.append(emptyOption);
    savedRecordsList.replaceChildren();
    records.forEach((record) => {
        const option = document.createElement("option");
        option.value = record.id;
        option.textContent = `${text(record.Animal?.Nome)} / ${text(record.Cliente?.Nome)}`;
        recordSelect.append(option);
        const item = document.createElement("article");
        item.className = "saved-record-item";
        const title = document.createElement("strong");
        title.textContent = `${text(record.Animal?.Nome)} / ${text(record.Cliente?.Nome)}`;
        const date = document.createElement("small");
        date.textContent = `Salvo em ${new Date(record.criadoEm).toLocaleString("pt-BR")}`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "record-delete";
        button.textContent = "Excluir";
        button.addEventListener("click", () => removeRecord(record.id));
        item.append(title, date, button);
        savedRecordsList.append(item);
    });
}

function removeRecord(id) {
    const selected = records.find((record) => record.id === id);
    if (!selected || !window.confirm(`Excluir o cadastro de ${text(selected.Animal?.Nome)}?`)) return;
    records = records.filter((record) => record.id !== id);
    saveRecords();
    renderSavedRecords();
    renderRecord(exampleRecord);
    formMessage.textContent = "Cadastro excluído.";
}

function recordFromForm(values) {
    return {
        id: createId(),
        criadoEm: new Date().toISOString(),
        Cliente: { Nome: text(values.clientName), Contato: text(values.clientContact), "E-mail": text(values.clientEmail) },
        Animal: { Nome: text(values.animalName), "Espécie": text(values.animalSpecies), "Raça": text(values.animalBreed), Idade: text(values.animalAge), Sexo: text(values.animalSex), Peso: text(values.animalWeight) },
        Atendimento: { "Última consulta": formatDate(values.lastAppointment), Observações: text(values.notes) }
    };
}

recordSelect?.addEventListener("change", () => {
    const selected = records.find((record) => record.id === recordSelect.value);
    renderRecord(selected || exampleRecord);
});

registrationForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!registrationForm.reportValidity()) return;
    try {
        const record = recordFromForm(Object.fromEntries(new FormData(registrationForm)));
        records.unshift(record);
        saveRecords();
        renderSavedRecords();
        recordSelect.value = record.id;
        renderRecord(record);
        registrationForm.reset();
        formMessage.textContent = "Cadastro salvo com sucesso neste navegador.";
    } catch (error) {
        console.error("Não foi possível salvar o cadastro.", error);
        formMessage.textContent = "Não foi possível salvar o cadastro.";
    }
});

async function loadExample() {
    try {
        const response = await fetch("../data/ficha.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        exampleRecord = await response.json();
        renderRecord(exampleRecord);
    } catch (error) {
        console.error("Não foi possível carregar a ficha de exemplo.", error);
        recordGrid.textContent = "Não foi possível carregar a ficha de exemplo.";
    }
}

records = readRecords();
renderSavedRecords();
loadExample();
const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = new Date().getFullYear();
