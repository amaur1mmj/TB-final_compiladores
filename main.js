const fs = require('fs');
const { parseCode, program, error } = require('./analyzer');

function main() {
    // Leitura assíncrona do código do arquivo
    fs.readFile('test/teste2.c', 'utf-8', (err, code) => {
        if (err) {
            console.error(`Erro ao ler o arquivo: ${err}`);
            return process.exit(1);
        }

        try {
            // Remover comentários do código
            const regexBlockComment = /\/\*[\s\S]*?\*\//g;
            const regexLineComment = /\/\/[^\n]*/g;
            const codeWithoutComments = code.replace(regexBlockComment, '').replace(regexLineComment, '');

            // Analisar código
            const tokens = parseCode(codeWithoutComments);

            // Nome do arquivo de saída
            const outputFileName = "output.js";

            // Obter código JavaScript
            const jsCode = program();

            // Escrita assíncrona no arquivo de saída
            fs.writeFile(outputFileName, jsCode, 'utf-8', (err) => {
                if (err) {
                    console.error(`Erro ao escrever o arquivo de saída: ${err}`);
                    return process.exit(1);
                }

                console.log("\nAnálise sintática concluída com sucesso!!!");

                console.log(
                    `\nTradução para JavaScript concluída com sucesso!!!. Arquivo de saída gerado: ${outputFileName}`
                );
            });
        } catch (e) {
            if (e instanceof SyntaxError) {
                console.log(`${e.message}`);
            } else {
                console.log(`Erro inesperado: ${e}`);
            }
            return process.exit(1);
        }
    });
}

if (require.main === module) {
    main();
}
