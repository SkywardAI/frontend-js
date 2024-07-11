// export function formatMarkdown(input) {
//     input.split('\n').map(line=>{
        
//     })
// }

export function formatJSON(conversation, {createdAt, name}) {
    const json = 
`{
    "session": {
        "id": "${conversation.id}",
        "createdAt": "${createdAt}",
        "title": "${name}",
        "history": [
            ${conversation.history.map(({type, message})=>{
                return `{ "type": "${type}", "message": "${message.replaceAll('"', '\\"').replaceAll("\n", "\\n")}" }`
            }).join(`,\n${" ".repeat(12)}`)}
        ]
    }
}`
    const download_link = document.createElement('a')
    download_link.href=`data:text/plain;charset=utf-8,${json}`
    download_link.download = `session-${conversation.id}.json`
    download_link.click();
}