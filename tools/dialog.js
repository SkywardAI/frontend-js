let max_z_index = 100;
const displaying = [];

function closeDialogListener(evt) {
    if(evt.key === 'Escape') {
        displaying.length && displaying.pop()();
    }
}

document.addEventListener("keydown", closeDialogListener)

export default function createDialog(modal_close_on_click = true) {
    const dialog = document.createElement('div');
    dialog.className = 'mock-dialog';

    let open_status = false, opened_idx = -1;

    function close(manual = true) {
        open_status = false;
        dialog.classList.remove('show', 'modal');
        if(manual) {
            if(opened_idx >= 0) displaying.splice(opened_idx, 1); 
        }
        if(!displaying.length) {
            max_z_index = 100;
        }
        opened_idx = -1;
        dialog.removeAttribute('style')
    }

    if(modal_close_on_click) dialog.onclick = close;

    function display(modal = false) {
        open_status = true;
        dialog.classList.add('show');
        modal && dialog.classList.add('modal');
        max_z_index += 1;
        dialog.style.zIndex = `${max_z_index}`;
        opened_idx = displaying.length;
        displaying[opened_idx] = close;
    }

    function show() {
        display();
    }

    function showModal() {
        display(true);
    }

    function toggle() {
        open_status = !open_status;
        open_status ? show() : close();
        return open_status;
    }

    function toggleModal() {
        open_status = !open_status;
        open_status ? showModal() : close();
        return open_status;
    }

    function getStatus() {
        return open_status;
    }

    return [ dialog, { show, showModal, close, toggle, toggleModal, getStatus } ];
}