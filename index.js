import createSideBar from "./components/sidebar.js";
import { loadDefaultPage } from "./global/switchPage.js";

function build() {
    createSideBar();
    loadDefaultPage();
}

window.onload = build;