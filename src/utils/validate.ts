import validator from "validator";
interface UserInput {
    userName?: string;
    email?: string;
    password?: string;
}

export const validateUserInput = (user: UserInput) => {
    const { userName, email, password } = user;
    if (!userName || !email || !password) {
        throw new Error("All fields are required");
    }
    if (userName.length < 3 || userName.length > 20) {
        throw new Error("Username must be between 3 and 20 characters");
    }
    if (!validator.isEmail(email)) {
        throw new Error("Invalid email format");
    }
    if(!validator.isStrongPassword(password)){
        throw new Error("Password must include 1 capital letter, 1 lowercase letter, 1 number and 1 symbol and be at least 8 characters long");
    }
}