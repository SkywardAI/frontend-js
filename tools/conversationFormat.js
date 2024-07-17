export function formatMarkdown(str, target_elem, pending_elem, end_special_block = null, force = false) {
    if(!str.includes('\n') && !force) {
        pending_elem.textContent = str;
        return null;
    }
    const whole_lines = str.split('\n');
    let content_left = ''
    if(!force) content_left = whole_lines.pop();
    pending_elem.textContent = content_left;

    function parseSingleLine(pattern_name) {
        return (_, group_1, group_2) => {
            switch(pattern_name) {
                case 'header':
                    return `<h${group_1.length}>${group_2}</h${group_1.length}>`;
                case 'bold': return `<strong>${group_1}</strong>`;
                case 'italic': return `<em>${group_1}</em>`;
                case 'bold-italic': return `<em><strong>${group_1}</strong></em>`;
                case 'hr': return '</hr>';
                case 'inline-code': return `<span class="inline-code">${group_2||group_1}</span>`;
            }
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
        line.replaceAll('  ', '&nbsp;&nbsp;');
        if(end_special_block) {
            pending_elem.insertAdjacentHTML("beforebegin",line||"</br>");
        } else {
            const parsed_line = !line ? "</br>" : line
            .replace(/(#{6}|#{5}|#{4}|#{3}|#{2}|#{1}) (.*$)/, parseSingleLine('header'))
            .replaceAll(/[*_]{3,}(.+?)[*_]{3,}/g, parseSingleLine('bold-italic'))
            .replaceAll(/\*\*(.+?)\*\*/g, parseSingleLine('bold'))
            .replaceAll(/__(.+?)__/g, parseSingleLine('italic'))
            .replaceAll(/^(\*|-){3,}$/g, parseSingleLine('hr'))
            .replaceAll(/``(.+?)``|`(.+?)`/g, parseSingleLine('inline-code'))

            pending_elem.insertAdjacentHTML("beforebegin", parsed_line);
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
                return `{ "role": "${role}", "message": "${message.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll("\n", "\\n")}" }`
            }).join(`,\n${" ".repeat(12)}`)}
        ]
    }
}`
    const download_link = document.createElement('a')
    download_link.href=`data:text/plain;charset=utf-8,${json}`
    download_link.download = `session-${conversation.id}.json`
    download_link.click();
}