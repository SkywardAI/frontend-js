import createInfoPage from "./info-page.js";
import getSVG from "../tools/svgs.js";

const pages = [
    { name: 'chat', svgName: 'chat-dots-fill' },
    { name: 'model-hero', svgName: 'hero' },
    { name: 'training' },
    { name: 'info', svgName: 'info-circle-fill', not_page: true }
]

export default function createSideBar(switchSelectedPage) {
    const sidebar = document.getElementById('sidebar');

    sidebar.innerHTML = `
    ${pages.map(({name, svgName})=>{
        return `
        <div id='sidebar-icon-${name}' class='sidebar-icon clickable'>
            ${getSVG(svgName || name)}
        </div>
        `
    }).join('')}`

    pages.forEach(({name, not_page}) => {
        if(not_page) return;

        document.getElementById(`sidebar-icon-${name}`).onclick = 
        () => switchSelectedPage(name);
    })
    createInfoPage();

    switchSelectedPage(pages[0].name);
}