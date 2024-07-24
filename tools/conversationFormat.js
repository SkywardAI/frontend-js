function createElement(tagName, textContent = '', args = {}) {
    const elem = document.createElement(tagName);
    if(textContent) elem.textContent = textContent;
    const { appendChild, ...html_element_args } = args;

    if(appendChild) {
        elem.appendChild(appendChild);
    }

    for(const key in html_element_args) {
        elem[key] = args[key];
    }
    return elem;
}

export function formatMarkdown(str, target_elem, pending_elem, end_special_block = null, force = false) {
    if(!str.includes('\n') && !force) {
        pending_elem.textContent = str;
        return null;
    }
    const whole_lines = str.split('\n');
    let content_left = ''
    if(!force) content_left = whole_lines.pop();
    pending_elem.textContent = content_left;
    const plain_text_elems = [];

    function parseSingleLine(pattern_name) {
        return (_, group_1, group_2) => {
            switch(pattern_name) {
                case 'header':
                    plain_text_elems.push(createElement(`h${group_1.length}`, group_2));
                    break;
                case 'bold': 
                    plain_text_elems.push(createElement(`strong`, group_1));
                    break;
                case 'italic': 
                    plain_text_elems.push(createElement(`em`, group_1));
                    break;
                case 'bold-italic': 
                    plain_text_elems.push(
                        createElement(`em`, '', {
                            appendChild: createElement('strong', group_1)
                        })
                    );
                    break;
                case 'hr': 
                    plain_text_elems.push(createElement('hr'))
                    break;
                case 'inline-code': 
                    plain_text_elems.push(createElement('span', group_1 || group_2, { className: 'inline-code' }))
                    break;
                default:
                    return '';
            }
            return `<|SPLIT_BY_INLINE_CODE|>`;
        }
    }

    function parseLine(line) {
        // test if this line is start/end of a code block
        const match_code = line.match(/`{3,}/)
        if(match_code) {
            if(end_special_block) {
                if(match_code[0] === end_special_block) {
                    end_special_block = null;
                    target_elem.appendChild(pending_elem)
                    return;
                }
            } else{
                const pattern = match_code[0]
                const elem = document.createElement('div')
                elem.className = 'code-block';
                target_elem.appendChild(elem);
    
                end_special_block = pattern;
                elem.appendChild(pending_elem);
                return;
            }
        }

        // replace white spaces, no need for single white space
            line = line.replaceAll('  ', '\xa0\xa0');
        if(end_special_block) {
            // we need this line to be plaintext instead of html
            // otherwise if there's html code, this will be transformed, which we don't want this result
            pending_elem.insertAdjacentText("beforebegin",line);
            pending_elem.insertAdjacentHTML("beforebegin",'</br>');
        } else {
            const parsed_line = line
            .replace(/(#{6}|#{5}|#{4}|#{3}|#{2}|#{1}) (.*$)/, parseSingleLine('header'))
            .replaceAll(/[*_]{3,}(.+?)[*_]{3,}/g, parseSingleLine('bold-italic'))
            .replaceAll(/\*\*(.+?)\*\*/g, parseSingleLine('bold'))
            .replaceAll(/__(.+?)__/g, parseSingleLine('italic'))
            .replaceAll(/^(\*|-){3,}$/g, parseSingleLine('hr'))
            .replaceAll(/``(.+?)``|`(.+?)`/g, parseSingleLine('inline-code'))
            .replace(/<\|end\|>$/, '');

            const block = document.createElement('div');
            block.className = 'single-line';
            if(plain_text_elems.length) {
                const elems_to_append = [];
                const text_elements = parsed_line.split('<|SPLIT_BY_INLINE_CODE|>')
                while(text_elements.length) {
                    elems_to_append.push(text_elements.shift());
                    elems_to_append.push(plain_text_elems.shift() || '');
                }
                // for(const i of elems_to_append) {
                //     if(typeof i === 'string') block.insertAdjacentHTML("beforeend", i);
                //     else if(i instanceof HTMLElement) block.appendChild(i);
                // }
                block.append(...elems_to_append);
            } else {
                block.textContent = parsed_line;
            }
            pending_elem.insertAdjacentElement("beforebegin", block);
        }
    }

    whole_lines.forEach(line=>{
        parseLine(line)
    })

    force && pending_elem.remove();

    return [content_left, end_special_block]
}

export function formatJSON(conversation, {createdAt, name}) {
    const json = 
`{
    "session": {
        "id": "${conversation.id}",
        "createdAt": "${createdAt}",
        "title": "${name}",
        "history": [
            ${conversation.history.map(({role, message})=>{
                const msg_str = message.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll("\n", "\\n")
                return `{ "role": "${role}", "message": "${msg_str}" }`
            }).join(`,\n${" ".repeat(12)}`)}
        ]
    }
}`

    const json_file = new Blob([json], {type: 'text/plain'});
    const url = URL.createObjectURL(json_file);
    const download_link = document.createElement('a')
    download_link.href = url;
    download_link.download = `session-${conversation.id}.json`
    download_link.click();
    URL.revokeObjectURL(url);
}