const vscode = require('vscode');

const ARS_DOCS = {
    'DEFINE': '**DEFINE**\n\nDichiara un insieme (`ipset`, `urlset`, `set`) o una regola (`AR`, `VR`). Termina sempre con `;`.',
    'AR': '**AR (Access Rule - Regola IPS)**\n\nSintassi EBNF: `DEFINE AR <nome> CONDITION <basic_access_rules> ACTION <access_operations> ;`\n\nValutata sequenzialmente dall\'alto verso il basso.',
    'VR': '**VR (Validation Rule - Regola IDS)**\n\nSintassi EBNF: `DEFINE VR <nome> CONDITION <clauses> ;`\n\nSupporta espressioni logiche (`and`, `or`, `(...)`), sequenze temporali (`next`), variabili locali (`var`) e azioni (`REPORT`, `Mysql.append`, `add`, `del`, `Enable`/`Disable`).',
    'CONDITION': '**CONDITION**\n\nInizia la sezione delle condizioni logiche della regola `AR` o `VR`.',
    'ACTION': '**ACTION**\n\nDefinisce le azioni da eseguire quando la condizione o il fattore della clausola è verificato.',
    'var': '**var (sezione_lista_with)**\n\nPermette di estrarre e assegnare variabili locali dentro una regola `VR` prima di `ACTION` (es. `var user = http.query["username"]`).',
    'next': '**next (Operatore Temporale VR)**\n\nConcatena due clausole in sequenza temporale dentro una regola `VR`: `<clausola_1> next <clausola_2>`.',
    'EXISTS': '**EXISTS**\n\nVerifica che un parametro, header, cookie o tag esista nella richiesta/risposta (es. `EXISTS http.header["Authorization"]`).',
    'ipset': '**ipset**\n\nInsieme di indirizzi IP e porte con supporto wildcard `*` (es. `{ *.*.*.*:* }`).',
    'urlset': '**urlset**\n\nInsieme di percorsi URL con supporto wildcard `*` (es. `{ /login, /login/* }`).',
    'set': '**set**\n\nInsieme di stringhe manipolabile dinamicamente a runtime tramite `add`, `del` o indicizzazione `@`.',
    'obs.event': '**obs.event (OBS_EVENT)**\n\nEvento di rete osservato (es. `net.send`, `net.recv`).',
    'obs.name': '**obs.name (OBS_NAME)**\n\nNome dell\'osservabile corrente.',
    'obs.time': '**obs.time (OBS_TIME)**\n\nTimestamp dell\'evento osservato.',
    'obs.obsid': '**obs.obsid (OBS_OBSID)**\n\nIdentificativo univoco dell\'osservazione.',
    'obs.stime': '**obs.stime (OBS_STIME)**\n\nStart time dell\'osservazione.',
    'obs.etime': '**obs.etime (OBS_ETIME)**\n\nEnd time dell\'osservazione.',
    'obs.tag': '**obs.tag (OBS_TAG)**\n\nTag associato all\'evento osservato (supporta anche `obs.tag["chiave"]`).',
    'sa.os': '**sa.os (SA_OS)**\n\nSistema operativo rilevato dal System Agent.',
    'sa.logged_user': '**sa.logged_user (SA_LOGGED_USER)**\n\nUtente autenticato rilevato dal System Agent.',
    'sa.process_name': '**sa.process_name (SA_PROCESS_NAME)**\n\nNome del processo rilevato dal System Agent.',
    'agent.id': '**agent.id**\n\nIdentificativo dell\'agente.',
    'http.host': '**http.host (HTTP HOST)**\n\nDominio/Host della richiesta HTTP.',
    'http.url': '**http.url (HTTP URL)**\n\nPercorso URL della richiesta HTTP.',
    'http.uri': '**http.uri (HTTP URI)**\n\nURI completo della richiesta HTTP.',
    'http.method': '**http.method (HTTP_METHOD)**\n\nMetodo HTTP (`HTTP.GET`, `HTTP.POST`, ecc.).',
    'http.code': '**http.code (HTTP_ANSWER_CODE)**\n\nCodice di stato della risposta HTTP (es. `200`, `404`, `500`).',
    'http.header': '**http.header["nome"] (HTTP_HEADER)**\n\nAccede a un header HTTP o a `"0_FULL_DATA"` per tutti gli header.',
    'http.cookie': '**http.cookie["nome"] (HTTP_COOKIE)**\n\nAccede a uno specifico cookie della richiesta HTTP.',
    'http.query': '**http.query["param"] (HTTP_QUERY)**\n\nAccede a un parametro della query string URL.',
    'http.data': '**http.data["param"] (HTTP_DATA)**\n\nAccede a un campo del body HTTP o a `"0_FULL_DATA"`.',
    'http.answer.code': '**http.answer.code (HTTP_ANSWER_CODE)**\n\nCodice di stato della risposta HTTP.',
    'http.answer.header': '**http.answer.header["nome"] (HTTP_ANSWER_HEADER)**\n\nHeader della risposta HTTP.',
    'http.answer.cookie': '**http.answer.cookie["nome"] (HTTP_ANSWER_COOKIE)**\n\nCookie della risposta HTTP.',
    'http.answer.data': '**http.answer.data["nome"] (HTTP_ANSWER_DATA)**\n\nBody/Payload della risposta HTTP.',
    'net.ipdst': '**net.ipdst (NET_TCP_IPDST)**\n\nIndirizzo IP e porta di destinazione.',
    'net.ipsrc': '**net.ipsrc (NET_TCP_IPSRC)**\n\nIndirizzo IP e porta sorgente.',
    'net.sesid': '**net.sesid (NET_TCP_SESID)**\n\nID della sessione TCP.',
    'net.result': '**net.result (NET_RESULT)**\n\nRisultato booleano (`true` / `false`) dell\'operazione di rete.',
    'net.send': '**net.send**\n\nEvento di invio dati/richiesta sulla rete.',
    'net.recv': '**net.recv**\n\nEvento di ricezione dati/risposta dalla rete.',
    'http.redirect': '**http.redirect "url" (HTTP_REDIRECT)**\n\nRedirige il client tramite risposta HTTP verso l\'URL specificato.',
    'tcp.redirect': '**tcp.redirect "ip:porta" (TCP_REDIRECT)**\n\nInoltra la connessione TCP verso l\'indirizzo e porta specificati.',
    'ANSWER': '**ANSWER "html"**\n\nRisponde direttamente al client con il contenuto specificato.',
    'REPORT': '**REPORT target { ... }**\n\nInvia un report di log contenente le variabili o concatenazioni `CAT`.',
    'CAT': '**CAT { elem1, elem2, ... }**\n\nConcatena una lista di osservabili e stringhe.',
    'Mysql.append': '**Mysql.append(host, user, pass, db, table, { ... })**\n\nInserisce un record di log direttamente in una tabella MySQL.',
    'scm.manage': '**scm.manage**\n\nAzione di gestione SCM sugli osservabili.',
    'scm.give': '**scm.give**\n\nRestituisce un valore al modulo SCM.',
    'BANDWIDTH': '**BANDWIDTH**\n\nLimita o imposta la banda per la connessione corrente.',
    'trace': '**trace**\n\nTraccia tre parametri/identificatori nella regola di accesso.'
};

function stripComments(text) {
    return text
        .replace(/\(\*[\s\S]*?\*\)/g, match => match.replace(/[^\n]/g, ' '))
        .replace(/\/\/.*$/gm, match => ' '.repeat(match.length));
}

function activate(context) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('ars');
    context.subscriptions.push(diagnosticCollection);

    // 1. CONTROLLO ERRORI IN TEMPO REALE BASATO SUL GRAFO EBNF
    function updateDiagnostics(document) {
        if (document.languageId !== 'ars') return;

        const diagnostics = [];
        const rawText = document.getText();
        const cleanText = stripComments(rawText);

        // Verifica bilanciamento parentesi graffe, quadre e tonde
        const stack = [];
        const pairs = { '{': '}', '[': ']', '(': ')' };
        const closeToOpen = { '}': '{', ']': '[', ')': '(' };
        let inString = false;

        for (let i = 0; i < cleanText.length; i++) {
            const ch = cleanText[i];
            if (ch === '"' && cleanText[i - 1] !== '\\') {
                inString = !inString;
                continue;
            }
            if (inString) continue;

            if (pairs[ch]) {
                stack.push({ char: ch, index: i });
            } else if (closeToOpen[ch]) {
                if (stack.length === 0 || stack[stack.length - 1].char !== closeToOpen[ch]) {
                    const pos = document.positionAt(i);
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(pos, pos.translate(0, 1)),
                        `Parentesi '${ch}' non bilanciata.`,
                        vscode.DiagnosticSeverity.Error
                    ));
                } else {
                    stack.pop();
                }
            }
        }
        for (const unclosed of stack) {
            const pos = document.positionAt(unclosed.index);
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(pos, pos.translate(0, 1)),
                `Parentesi '${unclosed.char}' aperta ma mai chiusa.`,
                vscode.DiagnosticSeverity.Error
            ));
        }

        // Controllo blocchi DEFINE (program -> set_definition | vr_definition | ar_definition)
        const defineRegex = /\bDEFINE\b/gi;
        let match;
        const definePositions = [];
        while ((match = defineRegex.exec(cleanText)) !== null) {
            definePositions.push(match.index);
        }

        for (let i = 0; i < definePositions.length; i++) {
            const start = definePositions[i];
            const end = (i + 1 < definePositions.length) ? definePositions[i + 1] : cleanText.length;
            const blockText = cleanText.slice(start, end);

            if (!blockText.includes(';')) {
                const startPos = document.positionAt(start);
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(startPos, startPos.translate(0, 6)),
                    "Manca il punto e virgola ';' alla fine della dichiarazione DEFINE.",
                    vscode.DiagnosticSeverity.Error
                ));
            }

            // Controllo specifico AR (richiede CONDITION e ACTION secondo ar_definition)
            if (/^DEFINE\s+AR\b/i.test(blockText)) {
                if (!/\bCONDITION\b/i.test(blockText)) {
                    const pos = document.positionAt(start);
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(pos, pos.translate(0, 9)),
                        "Sintassi AR non valida: manca la parola chiave CONDITION.",
                        vscode.DiagnosticSeverity.Error
                    ));
                }
                if (!/\bACTION\b/i.test(blockText)) {
                    const pos = document.positionAt(start);
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(pos, pos.translate(0, 9)),
                        "Sintassi AR non valida: manca la parola chiave ACTION.",
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }

            // Controllo specifico VR (richiede CONDITION secondo vr_definition)
            if (/^DEFINE\s+VR\b/i.test(blockText)) {
                if (!/\bCONDITION\b/i.test(blockText)) {
                    const pos = document.positionAt(start);
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(pos, pos.translate(0, 9)),
                        "Sintassi VR non valida: manca la parola chiave CONDITION.",
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }
        }

        // Avviso intelligente per tag HTML chiusi male dentro answer (es. </> invece di </h1>)
        const badHtmlRegex = /<\/>/g;
        while ((match = badHtmlRegex.exec(cleanText)) !== null) {
            const pos = document.positionAt(match.index);
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(pos, pos.translate(0, 3)),
                "Tag di chiusura HTML incompleto '</>': intendevi forse '</h1>' o '</p>'?",
                vscode.DiagnosticSeverity.Warning
            ));
        }

        diagnosticCollection.set(document.uri, diagnostics);
    }

    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document);
    }
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) updateDiagnostics(editor.document);
        }),
        vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document))
    );

    // 2. VISTA STRUTTURA (OUTLINE) E BREADCRUMBS
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider('ars', {
            provideDocumentSymbols(document) {
                const symbols = [];
                const cleanText = stripComments(document.getText());
                const regex = /\bDEFINE\s+(AR|VR|ipset|urlset|set)\s+(?:"([^"]+)"|([a-zA-Z_][a-zA-Z0-9_]*))([\s\S]*?;)/gi;
                let match;

                while ((match = regex.exec(cleanText)) !== null) {
                    const type = match[1].toUpperCase();
                    const name = match[2] || match[3];
                    const fullMatch = match[0];
                    const startPos = document.positionAt(match.index);
                    const endPos = document.positionAt(match.index + fullMatch.length);
                    const range = new vscode.Range(startPos, endPos);

                    let kind = vscode.SymbolKind.Variable;
                    if (type === 'AR') kind = vscode.SymbolKind.Event;
                    else if (type === 'VR') kind = vscode.SymbolKind.Method;
                    else if (type === 'IPSET') kind = vscode.SymbolKind.Array;
                    else if (type === 'URLSET') kind = vscode.SymbolKind.Namespace;

                    const symbol = new vscode.DocumentSymbol(
                        name,
                        `[${type}]`,
                        kind,
                        range,
                        new vscode.Range(startPos, startPos.translate(0, match[0].split('\n')[0].length))
                    );
                    symbols.push(symbol);
                }
                return symbols;
            }
        })
    );

    // 3. HOVER DOCUMENTATION
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('ars', {
            provideHover(document, position) {
                const range = document.getWordRangeAtPosition(position, /[a-zA-Z_]+(\.[a-zA-Z_]+)*/);
                if (!range) return null;
                const word = document.getText(range);
                const doc = ARS_DOCS[word] || ARS_DOCS[word.toUpperCase()] || ARS_DOCS[word.toLowerCase()];
                if (doc) {
                    return new vscode.Hover(new vscode.MarkdownString(doc), range);
                }
                return null;
            }
        })
    );

    // 4. INTELLISENSE COMPLETO BASATO SUL GRAFO EBNF
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider('ars', {
            provideCompletionItems(document, position) {
                const linePrefix = document.lineAt(position).text.substr(0, position.character);

                if (linePrefix.endsWith('http.answer.')) {
                    return [
                        new vscode.CompletionItem('code', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('header["Content-Type"]', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('cookie["session"]', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('data["0_FULL_DATA"]', vscode.CompletionItemKind.Property)
                    ];
                }
                if (linePrefix.endsWith('http.')) {
                    return [
                        new vscode.CompletionItem('host', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('url', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('uri', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('method', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('code', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('header["0_FULL_DATA"]', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('header["userid"]', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('cookie["session"]', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('query["username"]', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('data["username"]', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('data["0_FULL_DATA"]', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('answer', vscode.CompletionItemKind.Module),
                        new vscode.CompletionItem('redirect "/"', vscode.CompletionItemKind.Method)
                    ];
                }
                if (linePrefix.endsWith('net.')) {
                    return [
                        new vscode.CompletionItem('ipdst', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('ipsrc', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('sesid', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('result', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('send', vscode.CompletionItemKind.EnumMember),
                        new vscode.CompletionItem('recv', vscode.CompletionItemKind.EnumMember)
                    ];
                }
                if (linePrefix.endsWith('obs.')) {
                    return [
                        new vscode.CompletionItem('event', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('name', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('time', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('obsid', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('stime', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('etime', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('tag', vscode.CompletionItemKind.Property)
                    ];
                }
                if (linePrefix.endsWith('sa.')) {
                    return [
                        new vscode.CompletionItem('os', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('logged_user', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('process_name', vscode.CompletionItemKind.Property)
                    ];
                }
                if (linePrefix.endsWith('tcp.')) {
                    return [
                        new vscode.CompletionItem('redirect "10.11.12.13:8888"', vscode.CompletionItemKind.Method)
                    ];
                }
                if (linePrefix.endsWith('scm.')) {
                    return [
                        new vscode.CompletionItem('manage', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('give', vscode.CompletionItemKind.Method)
                    ];
                }
                if (linePrefix.endsWith('Mysql.')) {
                    return [
                        new vscode.CompletionItem('append("127.0.0.1", "user", "pass", "db", "table", { })', vscode.CompletionItemKind.Method)
                    ];
                }
                if (linePrefix.endsWith('HTTP.')) {
                    return ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'].map(
                        m => new vscode.CompletionItem(m, vscode.CompletionItemKind.EnumMember)
                    );
                }

                const items = [
                    new vscode.CompletionItem('DEFINE', vscode.CompletionItemKind.Keyword),
                    new vscode.CompletionItem('CONDITION', vscode.CompletionItemKind.Keyword),
                    new vscode.CompletionItem('ACTION', vscode.CompletionItemKind.Keyword),
                    new vscode.CompletionItem('var', vscode.CompletionItemKind.Keyword),
                    new vscode.CompletionItem('next', vscode.CompletionItemKind.Keyword),
                    new vscode.CompletionItem('EXISTS', vscode.CompletionItemKind.Keyword),
                    new vscode.CompletionItem('AR', vscode.CompletionItemKind.Keyword),
                    new vscode.CompletionItem('VR', vscode.CompletionItemKind.Keyword),
                    new vscode.CompletionItem('ipset', vscode.CompletionItemKind.Class),
                    new vscode.CompletionItem('urlset', vscode.CompletionItemKind.Class),
                    new vscode.CompletionItem('set', vscode.CompletionItemKind.Class),
                    new vscode.CompletionItem('answer', vscode.CompletionItemKind.Function),
                    new vscode.CompletionItem('REPORT', vscode.CompletionItemKind.Function),
                    new vscode.CompletionItem('CAT', vscode.CompletionItemKind.Function),
                    new vscode.CompletionItem('Enable', vscode.CompletionItemKind.Function),
                    new vscode.CompletionItem('Disable', vscode.CompletionItemKind.Function),
                    new vscode.CompletionItem('BANDWIDTH', vscode.CompletionItemKind.Function),
                    new vscode.CompletionItem('trace', vscode.CompletionItemKind.Function),
                    new vscode.CompletionItem('is in', vscode.CompletionItemKind.Operator)
                ];

                const text = document.getText();
                const setRegex = /\bDEFINE\s+(?:ipset|urlset|set)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;
                let match;
                const seen = new Set();
                while ((match = setRegex.exec(text)) !== null) {
                    const setName = match[1];
                    if (!seen.has(setName)) {
                        seen.add(setName);
                        const item = new vscode.CompletionItem(setName, vscode.CompletionItemKind.Variable);
                        item.detail = 'Set definito nel file .ars';
                        items.push(item);
                    }
                }

                return items;
            }
        }, '.')
    );
}

function deactivate() {}

module.exports = { activate, deactivate };