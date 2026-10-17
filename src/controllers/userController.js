const userModel = require('../models/userModel');
const { createHash, randomBytes } = require('node:crypto');

const CODE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

function hash(value) {
    return createHash('sha256').update(value).digest('hex');
}

const getUsers = async (req, res) => {
    try {
        const { data, error } = await userModel.getAllUsers();

        if (error) throw error;

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller:", error); // Log lỗi ra terminal để dễ debug
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const { email, displayName, photoURL } = body;

        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Email không được để trống'
            });
        }

        if (displayName !== undefined && displayName !== null && typeof displayName !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'displayName phải là chuỗi hoặc null'
            });
        }

        if (photoURL !== undefined && photoURL !== null && typeof photoURL !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'photoURL phải là chuỗi hoặc null'
            });
        }

        const { data, error } = await userModel.signInWithGoogle({
            email: email.trim(),
            displayName: typeof displayName === 'string' ? displayName.trim() || null : null,
            photoURL: typeof photoURL === 'string' ? photoURL.trim() || null : null
        });

        if (error) throw error;

        return res.status(200).json({
            status: 'success',
            message: 'Đăng nhập thành công',
            data: data
        });
    } catch (error) {
        console.error('Lỗi Controller login:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Không thể đăng nhập lúc này'
        });
    }
};

const createDesktopAuthTicket = async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { idToken, state, codeChallenge } = body;

    if (
        typeof idToken !== 'string' ||
        idToken.length > 8192 ||
        typeof state !== 'string' ||
        !CODE_PATTERN.test(state) ||
        typeof codeChallenge !== 'string' ||
        !CODE_PATTERN.test(codeChallenge)
    ) {
        return res.status(400).json({ status: 'error', message: 'Yêu cầu đăng nhập desktop không hợp lệ.' });
    }

    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) {
        return res.status(503).json({ status: 'error', message: 'Máy chủ chưa cấu hình xác minh Firebase.' });
    }

    try {
        const identityResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
                signal: AbortSignal.timeout(10_000)
            }
        );

        if (!identityResponse.ok) {
            return res.status(401).json({ status: 'error', message: 'Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn.' });
        }

        const identity = await identityResponse.json();
        const firebaseUser = Array.isArray(identity.users) ? identity.users[0] : null;
        const isGoogleUser = Array.isArray(firebaseUser?.providerUserInfo) &&
            firebaseUser.providerUserInfo.some((provider) => provider.providerId === 'google.com');

        if (!firebaseUser?.email || firebaseUser.emailVerified !== true || !isGoogleUser) {
            return res.status(401).json({ status: 'error', message: 'Tài khoản Google chưa được xác minh.' });
        }

        const code = randomBytes(32).toString('base64url');
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();
        const { error } = await userModel.createDesktopAuthTicket({
            ticketHash: hash(code),
            stateHash: hash(state),
            codeChallenge,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || null,
            photoURL: firebaseUser.photoUrl || null,
            expiresAt
        });

        if (error) throw error;

        return res.status(201).json({
            status: 'success',
            data: { code, expiresAt }
        });
    } catch (error) {
        console.error('Failed to create desktop authentication ticket:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Không thể bắt đầu đăng nhập desktop lúc này.'
        });
    }
};

const redeemDesktopAuthTicket = async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { code, state, verifier } = body;

    if (
        typeof code !== 'string' ||
        !CODE_PATTERN.test(code) ||
        typeof state !== 'string' ||
        !CODE_PATTERN.test(state) ||
        typeof verifier !== 'string' ||
        !CODE_PATTERN.test(verifier)
    ) {
        return res.status(400).json({ status: 'error', message: 'Mã đăng nhập desktop không hợp lệ.' });
    }

    try {
        const { data, error } = await userModel.consumeDesktopAuthTicket({
            ticketHash: hash(code),
            stateHash: hash(state),
            codeChallenge: createHash('sha256').update(verifier).digest('base64url')
        });

        if (error) throw error;
        if (!data) {
            return res.status(401).json({
                status: 'error',
                message: 'Mã đăng nhập đã hết hạn, đã được sử dụng hoặc không hợp lệ.'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                email: data.email,
                displayName: data.display_name,
                photoURL: data.photo_url
            }
        });
    } catch (error) {
        console.error('Failed to redeem desktop authentication ticket:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Không thể xác nhận đăng nhập desktop lúc này.'
        });
    }
};

module.exports = { getUsers, login, createDesktopAuthTicket, redeemDesktopAuthTicket };