const tokens : [RegExp,string][] = [
    [new RegExp(/# de/), "sentence"],

    [new RegExp(/<=/), "math-operator"],
    [new RegExp(/</), "math-operator"],
    [new RegExp(/>=/), "math-operator"],
    [new RegExp(/>/), "math-operator"],
    [new RegExp(/!=/), "math-operator"],
    [new RegExp(/==/), "math-operator"],
    [new RegExp(/máximo/), "math-lit-operator"],
    [new RegExp(/maximo/), "math-lit-operator"],
    [new RegExp(/menos que/), "math-lit-operator"],
    [new RegExp(/al menos/), "math-lit-operator"],
    [new RegExp(/mínimo/), "math-lit-operator"],
    [new RegExp(/minimo/), "math-lit-operator"],
    [new RegExp(/mas que/), "math-lit-operator"],
    [new RegExp(/más que/), "math-lit-operator"],
    [new RegExp(/igual/), "math-lit-operator"],
    [new RegExp(/igual a/), "math-lit-operator"],
    [new RegExp(/es igual a/), "math-lit-operator"],

    [new RegExp(/desde/), "math-lit-operator"],
    [new RegExp(/a partir del/), "math-lit-operator"],
    [new RegExp(/hasta/), "math-lit-operator"],
    [new RegExp(/antes del/), "math-lit-operator"],

    [new RegExp(/el ultimo año/), "date-operator"],
    [new RegExp(/el último año/), "date-operator"],
    [new RegExp(/el año pasado/), "date-operator"],
    [new RegExp(/este año/), "date-operator"],
    [new RegExp(/los ultimos \d+ años/), "esp-date-operator"],
    [new RegExp(/los últimos \d+ años/), "esp-date-operator"],
    [new RegExp(/los primeros \d+ años/), "esp-date-operator"],
    [new RegExp(/mínimo/), "date-operator"],
    [new RegExp(/minimo/), "date-operator"],
    [new RegExp(/más que/), "date-operator"],
    [new RegExp(/igual/), "date-operator"],
    [new RegExp(/igual a/), "date-operator"],
    [new RegExp(/es igual a/), "date-operator"],

    [new RegExp(/'\w*'/), "value"],

    [new RegExp(/proyectos/), "model"],
    [new RegExp(/proyecto/), "model"],
    [new RegExp(/financiadores/), "model"],
    [new RegExp(/financiador/), "model"],
    [new RegExp(/organizaciones/), "model"],
    [new RegExp(/organizacion/), "model"],
    [new RegExp(/organización/), "model"],

    [new RegExp(/nombre/), "characteristic"],
    [new RegExp(/iniciaron/), "characteristic"],
    [new RegExp(/inició/), "characteristic"],
    [new RegExp(/inicio/), "characteristic"],
    [new RegExp(/duraron/), "characteristic"],
    [new RegExp(/duran/), "characteristic"],
    [new RegExp(/dura/), "characteristic"],
    [new RegExp(/sus organizaciones/), "characteristic"],
    [new RegExp(/sus indicadores/), "characteristic"],
    [new RegExp(/sus financiadores/), "characteristic"],
    [new RegExp(/su presupuesto/), "characteristic"],
    [new RegExp(/su presupuesto ejecutado/), "characteristic"],
    [new RegExp(/su presupuesto final/), "characteristic"],
    [new RegExp(/su presupuesto inicial/), "characteristic"],
    [new RegExp(/sus beneficiarios/), "characteristic"],
    [new RegExp(/se registraron/), "characteristic"],
    [new RegExp(/fueron registrados/), "characteristic"],
    [new RegExp(/fueron registradas/), "characteristic"],
    [new RegExp(/registrados/), "characteristic"],
    [new RegExp(/registradas/), "characteristic"],
    [new RegExp(/su tipo/), "characteristic"],
    [new RegExp(/se ubica/), "characteristic"],
    [new RegExp(/se ubican/), "characteristic"],
    [new RegExp(/se fundó/), "characteristic"],
    [new RegExp(/se fundaron/), "characteristic"],
    [new RegExp(/fueron fundadas/), "characteristic"],
    [new RegExp(/su sector/), "characteristic"],
    [new RegExp(/son legalizadas/), "characteristic"],
    [new RegExp(/no son legalizadas/), "characteristic"],
    [new RegExp(/no legalizados/), "characteristic"],
    [new RegExp(/no legalizadas/), "characteristic"],
    [new RegExp(/legalizados/), "characteristic"],
    [new RegExp(/legalizadas/), "characteristic"],
    [new RegExp(/sus socios iniciales/), "characteristic"],
    [new RegExp(/sus socios al inicio/), "characteristic"],
    [new RegExp(/mujeres/), "characteristic"],
    [new RegExp(/hombres/), "characteristic"],
    [new RegExp(/totales/), "characteristic"],
    [new RegExp(/sus beneficiarios/), "characteristic"],
    [new RegExp(/sus proyectos/), "characteristic"],
    [new RegExp(/se actualizaron/), "characteristic"],
    [new RegExp(/fueron actualizados/), "characteristic"],
    [new RegExp(/fueron actualizadas/), "characteristic"],
    [new RegExp(/actualizados/), "characteristic"],
    [new RegExp(/actualizadas/), "characteristic"],
    [new RegExp(/cooperan con nosotros/), "characteristic"],
    [new RegExp(/con los que cooperamos/), "characteristic"],

    [new RegExp(/que/), "sentence"],
    [new RegExp(/en/), "sentence"],
    
    [new RegExp(/o/), "logic-operator"],
    [new RegExp(/y/), "logic-operator"],
    
    [new RegExp(/es/), "math-operator"],
    [new RegExp(/son/), "math-operator"],
];

const colorRules = [
    { token: 'sentence', foreground: '0779e4' },
    { token: 'model', foreground: '900c3f', fontStyle: 'bold' },
    { token: 'math-operator', foreground: '27e3cd' },
    { token: 'math-lit-operator', foreground: '27e3cd' },
    { token: 'logic-operator', foreground: '27e3cd' },
    { token: 'date-operator', foreground: '679b9b' },
    { token: 'esp-date-operator', foreground: '679b9b' },
    { token: 'characteristic', foreground: 'ffa41b', fontStyle: 'bold'},
    { token: 'value', foreground: 'ff5722', fontStyle: 'bold'}
];

const getSuggestions = () => {
    let suggestions = [];

    let filteredTokens = tokens.filter(token => token[1] == 'characteristic' || token[1] == 'sentence' || token[1] == 'model' || token[1] == 'math-lit-operator' || token[1] == 'date-operator');

    for(let i = 0; i < filteredTokens.length; i++){
        
        let suggestion : string = filteredTokens[i][0].toString().replace(/\//g,'');

        suggestions.push(
            {
                label: suggestion,
                kind: monaco.languages.CompletionItemKind.Text,
                insertText: suggestion,
            }
        );
    }
    
    suggestions.push(
        {
            label: 'los ultimos # años',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'los últimos ${1:#} años',
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }
    );

    suggestions.push(
        {
            label: 'los últimos # años',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'los últimos ${1:#} años',
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }
    );

    suggestions.push(
        {
            label: 'los primeros # años',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'los primeros ${1:#} años',
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }
    );

    return suggestions;
}

export { tokens, colorRules, getSuggestions };