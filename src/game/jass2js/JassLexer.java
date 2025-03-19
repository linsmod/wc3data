const { createToken, Lexer } = require('chevrotain')

const tokens = [
  createToken("comment",  "\/\/.*").skip(),
  createToken("whitespace",  "\s+").skip(),
  createToken("RAWCODE",  "('''.*?''')"),
  createToken("COMMA",  ","),
  createToken("IF",  "if"),
  createToken("THEN",  "then"),
  createToken("ELSEIF",  "elseif"),
  createToken("ELSE",  "else"),
  createToken("ENDIF",  "endif"),
  createToken("GLOBALS",  "globals"),
  createToken("ENDGLOBALS",  "endglobals"),
  createToken("FUNCTION",  "function"),
  createToken("TAKES",  "takes"),
  createToken("TYPE",  "type"),
  createToken("ARRAY",  "array"),
  createToken("NULL",  "null"),
  createToken("TRUE",  "true"),
  createToken("FALSE",  "false"),
  createToken("CONSTANT",  "constant"),
  createToken("HEX_CONSTANT",  "0x(([0-9]|[a-f]|[A-F])*)"),
  createToken("DOLLAR_HEX_CONSTANT",  "\$(([0-9]|[A-F])*)"),
  createToken("RETURNS",  "returns"),
  createToken("RETURN",  "return"),
  createToken("EXTENDS",  "extends"),
  createToken("NATIVE",  "native"),
  createToken("ENDFUNCTION",  "endfunction"),
  createToken("AND",  "and(?=[\s()])"),
  createToken("OR",  "or(?=[\s()])"),
  createToken("LOCAL",  "local"),
  createToken("SET",  "set(?=\s)"),
  createToken("LOOP",  "loop(?=\s)"),
  createToken("EXITWHEN",  "exitwhen"),
  createToken("ENDLOOP",  "endloop"),
  createToken("NOTHING",  "nothing"),
  createToken("NOT",  "not"),
  createToken("CALL",  "call(?=\s)"),
  createToken("MULT",  "\*"),
  createToken("DIV",  "\/"),
  createToken("PLUS",  "\+"),
  createToken("MINUS",  "-"),
  createToken("ID",  "[a-zA-Z]\w*"),
  createToken("LPAREN",  "\("),
  createToken("RPAREN",  "\)"),
  createToken("LSQUAREPAREN",  "\["),
  createToken("RSQUAREPAREN",  "\]"),
  createToken("NOTEQUALS",  "!="),
  createToken("EQUALSEQUALS",  "=="),
  createToken("LESSOREQUALS",  "<="),
  createToken("GREATEROREQUALS",  ">="),
  createToken("EQUALS",  "="),
  createToken("LESS",  "<"),
  createToken("GREATER",  ">"),
  createToken("IDLITERAL",  "'.*?'"),
  createToken("STRINGLITERAL",  ""[\s\S]*?"").linebreak(),
  createToken("REAL",  "[0-9]+\.[0-9]+"),
  createToken("INTEGER",  "[0-9]+"),
  createToken("NL",  "[\r\n]+"),
]

const tokenVocabulary = {}

tokens.forEach(tokenType => {
  tokenVocabulary[tokenType.name] = tokenType
})
const JassLexer = new Lexer(tokens)

module.exports = {
  JassLexer,
  tokenVocabulary
}
