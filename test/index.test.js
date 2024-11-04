const axios = require('axios');

const BACKEND_URL = "http://localhost:8000/api/v1";

let username, email, password;
let token = '';

// Generate random string
const generateRandomString = (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

beforeAll(async () => {
    // Generate unique user credentials for this test run
    const randomSuffix = generateRandomString(5);
    username = `user_${randomSuffix}`;
    email = `email_${randomSuffix}@example.com`;
    password = `Pass_${generateRandomString(8)}`;

    // Health check
    try {
        const response = await axios.get(`${BACKEND_URL}/`);
        expect(response.status).toBe(200);
        expect(response.data.message).toBe("Health checked successfully");
    } catch (error) {
        throw new Error("Health check failed. Stopping tests.");
    }
});

describe('Authentication API Tests', () => {

    // Username availability tests
    test('Check username availability with a valid username', async () => {
        const validResponse = await axios.get(`${BACKEND_URL}/checkUsername`, {
            params: { username },
        });
        expect(validResponse.status).toBe(200);
        expect(validResponse.data.message).toBe("Username Available");
    });

    test('Check username availability with an invalid username (too short)', async () => {
        await axios.get(`${BACKEND_URL}/checkUsername`, {
            params: { username: 'ab' },
        }).catch(error => {
            expect(error.response.status).toBe(422);
        });
    });

    // User account creation tests
    test('User can create an account with valid data', async () => {
        const validUserData = {
            username,
            email,
            password,
        };

        const response = await axios.post(`${BACKEND_URL}/signUp`, validUserData);
        expect(response.status).toBe(201);
        expect(response.data.message).toBe("Account created successfully. An OTP has been sent to your email for verification.");
    });

    test('User cannot create an account with missing email', async () => {
        const invalidUserData = {
            username: `user_${generateRandomString(5)}`,
            password,
        };

        await axios.post(`${BACKEND_URL}/signUp`, invalidUserData).catch(error => {
            expect(error.response.status).toBe(422);
        });
    });

    test('User cannot create an account with a duplicate email', async () => {
        const validUserData = {
            username,
            email,
            password,
        };

        await axios.post(`${BACKEND_URL}/signUp`, validUserData).catch(error => {
            expect(error.response.status).toBe(409);
            expect(error.response.data.detail).toBe("A user with this email ID is already registered.");
        });
    });

    // User account verification tests
    test('User can verify account with correct OTP', async () => {
        const correctOtpData = {
            username,
            code: "123456",  // Replace with actual OTP in a real test setup or mock
        };

        const response = await axios.post(`${BACKEND_URL}/verify`, correctOtpData);
        expect(response.status).toBe(200);
        expect(response.data.message).toBe("User verified successfully!");
    });

    test('User cannot verify account with incorrect OTP', async () => {
        const incorrectOtpData = {
            username,
            code: "wrongOtp",
        };

        await axios.post(`${BACKEND_URL}/verify`, incorrectOtpData).catch(error => {
            expect(error.response.status).toBe(403);
            expect(error.response.data.detail).toBe("OTP is not valid!");
        });
    });

    // Login tests
    test('User can log in with correct credentials', async () => {
        const loginData = {
            username,
            password,
        };

        const response = await axios.post(`${BACKEND_URL}/login`, new URLSearchParams(loginData));
        expect(response.status).toBe(200);
        expect(response.data.message).toBe("user loggedIn successfully");
        expect(response.data.data).toHaveProperty("access_token");
    });

    test('User cannot log in with incorrect password', async () => {
        const incorrectLoginData = {
            username,
            password: "WrongPassword",
        };

        await axios.post(`${BACKEND_URL}/login`, new URLSearchParams(incorrectLoginData)).catch(error => {
            expect(error.response.status).toBe(401);
        });
    });

    test('User cannot log in if account is unverified', async () => {
        const unverifiedUsername = `unverified_${generateRandomString(5)}`;
        const unverifiedLoginData = {
            username: unverifiedUsername,
            password,
        };

        await axios.post(`${BACKEND_URL}/login`, new URLSearchParams(unverifiedLoginData)).catch(error => {
            expect(error.response.status).toBeGreaterThanOrEqual(400);
            expect(error.response.status).toBeLessThan(500);
        });
    });
});

