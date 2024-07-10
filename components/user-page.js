import getSVG from "../tools/svgs.js";

export default function createUserPage() {
    document.getElementById('user-avatar')
    .insertAdjacentHTML("afterbegin", getSVG('person-fill'))
}