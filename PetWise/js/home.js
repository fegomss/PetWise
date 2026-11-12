const recordGrid = document.querySelector("#record-grid");

async function loadRecord() {
    if (!recordGrid) {
        console.error("O elemento da ficha técnica não foi encontrado.");
        return;
    }

    try {
        const response = await fetch("../data/ficha.json", { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Falha ao carregar os dados: HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new TypeError("O JSON da ficha técnica deve ser um objeto.");
        }

        const cards = document.createDocumentFragment();

        for (const [groupName, fields] of Object.entries(data)) {
            if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
                throw new TypeError(`A seção "${groupName}" está inválida.`);
            }

            const card = document.createElement("article");
            card.className = "record-card";

            const heading = document.createElement("h3");
            heading.textContent = groupName;

            const fieldList = document.createElement("dl");
            fieldList.className = "record-fields";

            for (const [label, value] of Object.entries(fields)) {
                if (typeof value !== "string") {
                    throw new TypeError(`O campo "${label}" deve ser texto.`);
                }

                const field = document.createElement("div");
                field.className = "record-field";

                const term = document.createElement("dt");
                term.textContent = label;

                const description = document.createElement("dd");
                description.textContent = value;

                field.append(term, description);
                fieldList.append(field);
            }

            card.append(heading, fieldList);
            cards.append(card);
        }

        recordGrid.replaceChildren(cards);
    } catch (error) {
        console.error("Não foi possível carregar a ficha técnica.", error);
        recordGrid.textContent =
            "Não foi possível carregar a ficha. Verifique se o servidor local está ativo.";
    }
}

loadRecord();
