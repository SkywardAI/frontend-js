export const email_not_valid = 'Email pattern not valid!';
export const password_not_valid = 'Password should have at least 8 characters combines capital letters, lowercase letters, numbers and special characters.';
export const username_not_valid = 'Username should includes only letters, numbers, -, _ and white space, no less than 4 characters and no more than 20 characters.';

export function validateEmail(string) {
    return (
        /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(string)
    )
}

export function validatePassword(string) {
    return (
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[a-zA-Z\d!@#$%^&*()-_+=]{8,}$/.test(string)
    )
}

export function validateUsername(string) {
    return (
        /^[a-zA-Z0-9-_ ]{4,20}$/.test(string)
    )
}