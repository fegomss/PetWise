#include <stdio.h>
#include <stdlib.h>

#ifdef _MSC_VER
#pragma execution_character_set("utf-8")
#endif

typedef struct {
    const char *nome;
    const char *contato;
    const char *email;
} Cliente;

typedef struct {
    const char *nome;
    const char *especie;
    const char *raca;
    const char *idade;
    const char *sexo;
    const char *peso;
} Animal;

typedef struct {
    const char *ultima_consulta;
    const char *vacinacao;
    const char *observacoes;
} Atendimento;

static void escrever_string_json(FILE *arquivo, const char *texto) {
    const unsigned char *caractere = (const unsigned char *)texto;

    fputc('"', arquivo);
    while (*caractere != '\0') {
        switch (*caractere) {
            case '"':
                fputs("\\\"", arquivo);
                break;
            case '\\':
                fputs("\\\\", arquivo);
                break;
            case '\b':
                fputs("\\b", arquivo);
                break;
            case '\f':
                fputs("\\f", arquivo);
                break;
            case '\n':
                fputs("\\n", arquivo);
                break;
            case '\r':
                fputs("\\r", arquivo);
                break;
            case '\t':
                fputs("\\t", arquivo);
                break;
            default:
                if (*caractere < 0x20) {
                    fprintf(arquivo, "\\u%04x", (unsigned int)*caractere);
                } else {
                    fputc(*caractere, arquivo);
                }
                break;
        }
        caractere++;
    }
    fputc('"', arquivo);
}

static void escrever_campo_json(
    FILE *arquivo,
    const char *nome,
    const char *valor,
    int ultimo
) {
    fputs("    ", arquivo);
    escrever_string_json(arquivo, nome);
    fputs(": ", arquivo);
    escrever_string_json(arquivo, valor);
    fputs(ultimo ? "\n" : ",\n", arquivo);
}

int main(void) {
    const Cliente cliente = {
        "Cliente de demonstração",
        "Não informado",
        "cliente@example.com"
    };
    const Animal animal = {
        "Luna",
        "Canina",
        "Sem raça definida",
        "3 anos",
        "Fêmea",
        "12 kg"
    };
    const Atendimento atendimento = {
        "10/11/2026",
        "Registro de demonstração",
        "Dados fictícios para demonstração."
    };

    FILE *arquivo = fopen("data/ficha.json", "wb");
    if (arquivo == NULL) {
        perror("Não foi possível criar data/ficha.json");
        return EXIT_FAILURE;
    }

    fputs("{\n  \"Cliente\": {\n", arquivo);
    escrever_campo_json(arquivo, "Nome", cliente.nome, 0);
    escrever_campo_json(arquivo, "Contato", cliente.contato, 0);
    escrever_campo_json(arquivo, "E-mail", cliente.email, 1);
    fputs("  },\n  \"Animal\": {\n", arquivo);
    escrever_campo_json(arquivo, "Nome", animal.nome, 0);
    escrever_campo_json(arquivo, "Espécie", animal.especie, 0);
    escrever_campo_json(arquivo, "Raça", animal.raca, 0);
    escrever_campo_json(arquivo, "Idade", animal.idade, 0);
    escrever_campo_json(arquivo, "Sexo", animal.sexo, 0);
    escrever_campo_json(arquivo, "Peso", animal.peso, 1);
    fputs("  },\n  \"Atendimento\": {\n", arquivo);
    escrever_campo_json(arquivo, "Última consulta", atendimento.ultima_consulta, 0);
    escrever_campo_json(arquivo, "Vacinação", atendimento.vacinacao, 0);
    escrever_campo_json(arquivo, "Observações", atendimento.observacoes, 1);
    fputs("  }\n}\n", arquivo);

    if (ferror(arquivo)) {
        fclose(arquivo);
        fputs("Erro ao gravar os dados da ficha técnica.\n", stderr);
        return EXIT_FAILURE;
    }

    if (fclose(arquivo) != 0) {
        fputs("Erro ao fechar data/ficha.json.\n", stderr);
        return EXIT_FAILURE;
    }

    puts("Ficha técnica gerada em data/ficha.json.");
    return EXIT_SUCCESS;
}
