import getSVG from "../../tools/svgs.js";

export default function createAccountPage() {
    document.getElementById('user-avatar')
    .insertAdjacentHTML("afterbegin", getSVG('person-fill'))
}