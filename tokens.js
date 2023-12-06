const TokenClass = {
  PONTO_FLUTUANTE: /\d+\.\d+/,
  CONSTANTE_INTEIRA: /\b\d+\b/,
  PALAVRA_RESERVADA: /\b(struct|if|int|else|while|do|for|float|double|char|long|short|break|continue|case|switch|default|void|return|print|nil|fun(?:ction)?|var)\b/,
  OPERADOR: /(<|>|=|==|!=|<=|>=|\|\||&&|\+=|-=|\*=|-=|--|\+\+|\+|\/|->|\*|-|\||!|&|%|and|or)\b/,
  DELIMITADOR: /[\[\](){};,]/,
  CONSTANTE_TEXTO: /"[^"]*"/,
  IDENTIFICADOR: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/,
};

  
  let token_index = 0;
  let previous_token = null;
  
  class Token {
    constructor(token_class, lexeme, line, column) {
      this.token_class = token_class;
      this.lexeme = lexeme;
      this.line = line;
      this.column = column;
    }
  
    toString() {
      return `<${this.token_class}> ${this.lexeme}`;
    }
  }
  
  module.exports = {
    TokenClass,
    Token
  };
  