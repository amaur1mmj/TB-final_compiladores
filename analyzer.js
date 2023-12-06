const { TokenClass, Token } = require('./tokens');
  
  let tokens = [];
  let tokenIndex = 0;
  
  function parseCode(code) {
    let lines = code.split('\n');
    let lineNum = 1;

    for (let line of lines) {
        line = line.replace(/\s+/g, ' ').trim();
        console.log(`Line: ${line}`);
        let column = 1;

        while (line.length > 0) {
            let match = null;

            for (let tokenClass of Object.keys(TokenClass)) {
                console.log(`Token Class: ${tokenClass}`);
                let regex = TokenClass[tokenClass].source;
                console.log(`Regex: ${regex}`);
                let re = new RegExp('^' + regex);
                console.log(`Line before exec: ${line}`);
                match = re.exec(line);
                console.log(`Match: ${match}`);

                if (match) {
                    let lexeme = match[0];
                    let token = new Token(tokenClass, lexeme, lineNum, column);
                    console.log(`Token: ${token}`);
                    tokens.push(token);
                    line = line.substring(lexeme.length).trimLeft();
                    column += lexeme.length;
                    break;
                }
            }

            if (!match) {
                throw new SyntaxError(`Erro léxico na linha ${lineNum}, coluna ${column}: caractere inesperado: ${line[0]}`);
            }
        }

        lineNum += 1;
    }
    console.log(tokens)
    return tokens;
}

  
  function program() {
    tokenIndex = 0;
    let javascriptCode = "";
  
    while (!endOfFile()) {
      console.log('ele devia volta aqui?');
      javascriptCode += declaration() + "\n";
      
    }
  
    if (!endOfFile()) {
      error("Token inesperado", tokens[tokenIndex]);
    }
  
    return javascriptCode;
  }
  
  function declaration() {
    console.log(TokenClass.PALAVRA_RESERVADA,"passou em declaration");
    if (check(TokenClass.PALAVRA_RESERVADA, "fun")) {
      return funDecl();
    } else if (check(TokenClass.PALAVRA_RESERVADA, "var")) {
      return varDecl();
    } else if (check(TokenClass.PALAVRA_RESERVADA, "function")) {
      return functionDeclaration();
    } else {
      return statement();
    }
  }
  
  
  function funDecl() {
    match(TokenClass.PALAVRA_RESERVADA, "fun");
    const identifier = tokens[tokenIndex].lexeme;
    match(TokenClass.IDENTIFICADOR);
    match(TokenClass.DELIMITADOR, "(");
    let parametersStr = "";
    
    if (check(TokenClass.IDENTIFICADOR)) {
      parametersStr = parameters();
    }
  
    match(TokenClass.DELIMITADOR, ")");
    let javascriptCode = `function ${identifier}${parametersStr} {`;
    const blockCode = block();
    const indentationBlock = blockCode.split('\n').map(line => '\t' + line).join('\n');
    javascriptCode += `\n${indentationBlock}}`;
  
    return javascriptCode;
  }
  
  function varDecl() {
    match(TokenClass.PALAVRA_RESERVADA, "var");
    const identifier = tokens[tokenIndex].lexeme;
    match(TokenClass.IDENTIFICADOR);
    let javascriptCode = `let ${identifier}`;
    
    if (check(TokenClass.OPERADOR, "=")) {
      match(TokenClass.OPERADOR, "=");
      const content = expression();
      javascriptCode += ` = ${content}`;
    }
  
    match(TokenClass.DELIMITADOR, ";");
    return javascriptCode;
  }
  
  function statement() {
    if (check(TokenClass.PALAVRA_RESERVADA, "print")) {
      return printStmt();
    } else if (check(TokenClass.PALAVRA_RESERVADA, "if")) {
      return ifStmt();
    } else if (check(TokenClass.PALAVRA_RESERVADA, "for")) {
      return forStmt();
    } else if (check(TokenClass.PALAVRA_RESERVADA, "return")) {
      return returnStmt();
    } else if (check(TokenClass.PALAVRA_RESERVADA, "while")) {
      return whileStmt();
    } else if (check(TokenClass.DELIMITADOR, "{")) {
      return block();
    } else {
      return exprStmt();
    }
  }
  
  function ifStmt() {
    match(TokenClass.PALAVRA_RESERVADA, "if");
    match(TokenClass.DELIMITADOR, "(");
    const condition = expression();
    match(TokenClass.DELIMITADOR, ")");
    const thenStatement = statement();
  
    const indentationIf = thenStatement.split('\n').map(line => '\t' + line).join('\n');
    let javascriptCode = `if (${condition}) {\n${indentationIf}`;
  
    while (check(TokenClass.PALAVRA_RESERVADA, "else") && !check(TokenClass.PALAVRA_RESERVADA, "if")) {
      match(TokenClass.PALAVRA_RESERVADA, "else");
  
      if (check(TokenClass.PALAVRA_RESERVADA, "if")) {
        match(TokenClass.PALAVRA_RESERVADA, "if");
        const elifCondition = expression();
        const elifStatement = statement();
        const indentationElif = elifStatement.split('\n').map(line => '\t' + line).join('\n');
        javascriptCode += `\n} else if (${elifCondition}) {\n${indentationElif}`;
      } else {
        const elseStatement = statement();
        const indentationElse = elseStatement.split('\n').map(line => '\t' + line).join('\n');
        javascriptCode += `\n} else {\n${indentationElse}`;
      }
    }
  
    javascriptCode += "\n}";
    return javascriptCode;
  }
  function printStmt() {
    console.log(TokenClass.PALAVRA_RESERVADA, "passou pelo printStmt");
    match(TokenClass.PALAVRA_RESERVADA, "print");
    const content = expression();
    match(TokenClass.DELIMITADOR, ";");

    return `console.log(${content})`;
}



  
  function returnStmt() {
    match(TokenClass.PALAVRA_RESERVADA, "return");
    let returnValue = "";
  
    if (!check(TokenClass.DELIMITADOR, ";")) {
      returnValue = expression();
    }
  
    match(TokenClass.DELIMITADOR, ";");
    return `return ${returnValue};`;
  }
  function forStmt() {
    match(TokenClass.PALAVRA_RESERVADA, "for");
    match(TokenClass.DELIMITADOR, "(");
  
    if (check(TokenClass.PALAVRA_RESERVADA, "var")) {
      varDecl();
    } else if (!check(TokenClass.DELIMITADOR, ";")) {
      exprStmt();
    }
  
    match(TokenClass.DELIMITADOR, ";");
  
    if (!check(TokenClass.DELIMITADOR, ";")) {
      expression();
    }
  
    match(TokenClass.DELIMITADOR, ";");
  
    if (!check(TokenClass.DELIMITADOR, ")")) {
      expression();
    }
  
    match(TokenClass.DELIMITADOR, ")");
    const loopBody = statement();
  
    let javascriptCode = "for ";
  
    if (check(TokenClass.PALAVRA_RESERVADA, "var")) {
      javascriptCode += varDecl();
    } else {
      javascriptCode += exprStmt();
    }
  
    javascriptCode += `; ${expression()}; ${expression()}) {\n${loopBody}\n}`;
  
    return javascriptCode;
  }
  
  function whileStmt() {
    
    match(TokenClass.PALAVRA_RESERVADA, "while");
    match(TokenClass.DELIMITADOR, "(");
  
    const condition = expression();
  
    match(TokenClass.DELIMITADOR, ")");
    const body = statement();
  
    let javascriptCode = `while (${condition}) {\n\t${body}`;
    // const indentationBlock = '\n'.join(['\t' + line for line in body.split('\n')]);
    // javascriptCode += `\n${indentationBlock}`;
  
    return javascriptCode;
  }
  
  function block() {
   
    match(TokenClass.DELIMITADOR, "{");
    let javascriptCode = "";
  
    while (!check(TokenClass.DELIMITADOR, "}") && !endOfFile()) {
      javascriptCode += declaration() + "\n";
    }
  
    match(TokenClass.DELIMITADOR, "}");
    return javascriptCode;
  }
  
  function exprStmt() {
    const content = expression();
    match(TokenClass.DELIMITADOR, ";");
    return `${content}`;
  }
  
  function expression() {
    console.log('????')
    return assignment();
  }
  
  function assignment() {
  
    if (check(TokenClass.IDENTIFICADOR)) {
      const identifier = tokens[tokenIndex].lexeme;
      match(TokenClass.IDENTIFICADOR);
  
      if (check(TokenClass.OPERADOR, "=")) {
        match(TokenClass.OPERADOR, "=");
        const content = assignment();
        const javascriptCode = `${identifier} = ${content}`;
        return javascriptCode;
      } else {
        prevToken();
        return logicOr();
      }
    } else {
      return logicOr();
    }
  }
  
  function logicOr() {
    let javascriptCode = logicAnd();
  
    while (check(TokenClass.OPERADOR, "or")) {
      match(TokenClass.OPERADOR, "or");
      const rightOperand = logicAnd();
      javascriptCode = `${javascriptCode} || ${rightOperand}`;
    }
  
    return javascriptCode;
  }
  
  function logicAnd() {
    let javascriptCode = equality();
   
    while (check(TokenClass.OPERADOR, "and")) {
      match(TokenClass.OPERADOR, "and");
      const rightOperand = equality();
      javascriptCode = `${javascriptCode} && ${rightOperand}`;
    }
  
    return javascriptCode;
  }
  
  function equality() {
    let javascriptCode = comparison();
  
    while (check(TokenClass.OPERADOR, ["!=", "=="])) {
      const operator = tokens[tokenIndex].lexeme;
      match(TokenClass.OPERADOR);
      const rightOperand = comparison();
      javascriptCode = `${javascriptCode} ${operator} ${rightOperand}`;
    }
  
    return javascriptCode;
  }
  
  function comparison() {
    
    let javascriptCode = term();
  
    while (check(TokenClass.OPERADOR) && ["<", ">", "<=", ">="].includes(tokens[tokenIndex].lexeme)) {
      const operator = tokens[tokenIndex].lexeme;
      match(TokenClass.OPERADOR);
      const rightOperand = term();
      javascriptCode = `${javascriptCode} ${operator} ${rightOperand}`;
    }
  
    return javascriptCode;
  }
  function term() {
    let javascriptCode = factor();
    
    while (true) {
      if (check(TokenClass.OPERADOR, "+")) {
        const operator = tokens[tokenIndex].lexeme;
        match(TokenClass.OPERADOR, "+");
        const rightOperand = factor();
        javascriptCode = `${javascriptCode} ${operator} ${rightOperand}`;
      } else if (check(TokenClass.OPERADOR, "-")) {
        const operator = tokens[tokenIndex].lexeme;
        match(TokenClass.OPERADOR, "-");
        const rightOperand = factor();
        javascriptCode = `${javascriptCode} ${operator} ${rightOperand}`;
      } else {
        break;
      }
    }
  
    return javascriptCode;
  }
  
  function factor() {
    
    let javascriptCode = unary();
  
    while (check(TokenClass.OPERADOR, "/") || check(TokenClass.OPERADOR, "*")) {
      const operator = tokens[tokenIndex].lexeme;
      match(TokenClass.OPERADOR);
      const rightOperand = unary();
      javascriptCode = `${javascriptCode} ${operator} ${rightOperand}`;
    }
  
    return javascriptCode;
  }
  
  function unary() {
   
    if (check(TokenClass.OPERADOR, "!") || check(TokenClass.OPERADOR, "-")) {
      const operator = tokens[tokenIndex].lexeme;
      match(TokenClass.OPERADOR);
      const operand = unary();
      const javascriptCode = `${operator} ${operand}`;
      return javascriptCode;
    } else {
      return call();
    }
  }
  
  function call() {
    let javascriptCode = primary();
  
    while (check(TokenClass.DELIMITADOR, "(") || check(TokenClass.DELIMITADOR, ".")) {
      if (check(TokenClass.DELIMITADOR, "(")) {
        match(TokenClass.DELIMITADOR, "(");
        javascriptCode += `(${arguments()})`;
        match(TokenClass.DELIMITADOR, ")");
      } else if (check(TokenClass.DELIMITADOR, ".")) {
        match(TokenClass.DELIMITADOR, ".");
        const identifier = tokens[tokenIndex].lexeme;
        match(TokenClass.IDENTIFICADOR);
        javascriptCode += `.${identifier}`;
      }
    }
  
    return javascriptCode;
  }
  
  function primary() {
    console.log("chegou aqui?")
    if (
      check(TokenClass.PALAVRA_RESERVADA, "true") ||
      check(TokenClass.PALAVRA_RESERVADA, "false") ||
      check(TokenClass.PALAVRA_RESERVADA, "nil") ||
      check(TokenClass.PALAVRA_RESERVADA, "this") ||
      check(TokenClass.CONSTANTE_INTEIRA) ||
      check(TokenClass.CONSTANTE_TEXTO) ||
      check(TokenClass.IDENTIFICADOR)
    ) {
      const token = nextToken();
      
      if (token.lexeme === "nil") {
        return "null";
      } else {
        return token.lexeme;
      }
    } else if (check(TokenClass.PALAVRA_RESERVADA, "super")) {
      match(TokenClass.PALAVRA_RESERVADA, "super");
      match(TokenClass.DELIMITADOR, ".");
      const identifier = tokens[tokenIndex].lexeme;
      match(TokenClass.IDENTIFICADOR);
      return `super.${identifier}`;
    } else if (check(TokenClass.DELIMITADOR, "(")) {
      match(TokenClass.DELIMITADOR, "(");
      const javascriptCode = `(${expression()})`;
      match(TokenClass.DELIMITADOR, ")");
      return javascriptCode;
    } else {
      const token = endOfFile() ? null : tokens[tokenIndex];
      throw new SyntaxError(
        `\nToken inesperado na expressão primária: ${token.token_class.name} ${
          token.lexeme
        }, linha ${token.line}, coluna ${token.column}`
      );
    }
  }
  
  function functionDeclaration() {
    const identifier = tokens[tokenIndex].lexeme;
    match(TokenClass.IDENTIFICADOR);
    match(TokenClass.DELIMITADOR, '(');
    const parametersCode = parameters();
    match(TokenClass.DELIMITADOR, ')');
    const blockCode = block();
    const javascriptCode = `function ${identifier}${parametersCode} {\n${blockCode}\n}`;
    return javascriptCode;
  }
  
  function parameters() {
    const identifier = tokens[tokenIndex].lexeme;
    match(TokenClass.IDENTIFICADOR);
    let parametersCode = `(${identifier}`;
  
    while (check(TokenClass.DELIMITADOR, ",")) {
      match(TokenClass.DELIMITADOR, ",");
      const identifier = tokens[tokenIndex].lexeme;
      match(TokenClass.IDENTIFICADOR);
      parametersCode += `, ${identifier}`;
    }
  
    parametersCode += ")";
    return parametersCode;
  }
  
  function arguments() {
    let argumentCode = expression();
  
    while (check(TokenClass.DELIMITADOR, ",")) {
      match(TokenClass.DELIMITADOR, ",");
      argumentCode += `, ${expression()}`;
    }
  
    return argumentCode;
  }
    // FUNÇÕES AUXILIARES ***************************

function endOfFile() {
    return tokenIndex >= tokens.length;
  }
  
  function check(expectedClass, expectedValue = null) {
    if (!endOfFile()) {
      const token = tokens[tokenIndex];
      if (Array.isArray(expectedClass)) {
        return expectedClass.includes(token.lexeme) && (expectedValue === null || token.lexeme === expectedValue);
      } else {
        const regex = new RegExp(expectedClass.source, expectedClass.flags + "g");
        return regex.test(token.lexeme) && (expectedValue === null || token.lexeme === expectedValue);
      }
    }
    return false;
  }
  


  
  function match(expectedTokenClass, expectedTokenValue = null, functionName = null) {
    if (!check(expectedTokenClass, expectedTokenValue)) {
      const token = endOfFile() ? null : tokens[tokenIndex];
      const expectedValueStr = expectedTokenValue !== null ? expectedTokenValue : "None";
      const foundTokenClassStr = token !== null ? token.tokenClass.name : "None";
      const foundLexemeStr = token !== null ? token.lexeme : "None";
      const functionNameStr = functionName !== null ? ` na função ${functionName}` : "";
      const errorMessage = `\nErro de análise sintática: Esperado ${expectedTokenClass.name} ${expectedValueStr}, encontrado ${foundTokenClassStr} ${foundLexemeStr}${functionNameStr}`;
      error(errorMessage, token);
    } else {
      previousToken = tokens[tokenIndex];
      nextToken();
    }
  }
  
  function nextToken() {
    if (!endOfFile()) {
      const token = tokens[tokenIndex];
      console.log(`Token atual: ${token}`);
      tokenIndex += 1;
      console.log('novo atual kkkk');
      return token;
    } else {
      return null;
    }
  }
  
  function prevToken() {
    if (tokenIndex > 0) {
      tokenIndex -= 1;
      previousToken = tokens[tokenIndex];
      return tokens[tokenIndex];
    }
  }
  
  function error(message, token = null) {
    if (token) {
      message += `, na linha ${token.line}, coluna ${token.column}`;
    } else {
      message += " no final do arquivo";
    }
    throw new SyntaxError(message);
  }

  module.exports = {
    parseCode,
    program,
    error,
  };
