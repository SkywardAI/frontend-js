export default function createAccountPage() {

    document.getElementById('main').innerHTML = `
    <div class='account-page'>
        <div class='input-field'>
            <div class='title'>Username</div>
            <input type='text' id='account-input-username'>
        </div>
        <div class='input-field'>
            <div class='title'>Email</div>
            <input type='text' id='account-input-email'>
        </div>
        <div class='input-field'>
            <div class='title'>Password</div>
            <input type='text' id='account-input-password'>
        </div>
        <div class='submit-account-btn clickable'>Submit</div>
    </div>`

    return null;
}