const pages = [
    { name: 'chat' },
    { name: 'account', svgName: 'person' },
]

export default function createSideBar(switchSelectedPage) {
    const sidebar = document.getElementById('sidebar');

    sidebar.innerHTML = `
    ${pages.map(({name, svgName})=>{
        return `
        <div id='sidebar-icon-${name}' class='sidebar-icon clickable'>
            <img src='/medias/${svgName || name}.svg'>
        </div>
        `
    }).join('')}`

    pages.forEach(({name}) => {
        document.getElementById(`sidebar-icon-${name}`).onclick = 
        () => switchSelectedPage(name);
    })

    switchSelectedPage(pages[0].name);
}