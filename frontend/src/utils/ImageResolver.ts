/**
 * Shared image-source resolver.
 *
 * Handles the case where the DB stores a base64-encoded DATA URL,
 * i.e. base64("data:image/png;base64,iVBOR..."). We decode it once so the
 * browser receives a real renderable data URL.
 *
 * Also handles: raw base64, plain data URL, http(s) URLs, Node.js Buffers,
 * raw byte arrays, JSON-stringified strings, and double-prefixed data URLs.
 */

export const isImageDataUrl = (s: string): boolean =>
    /^data:image\/[a-z0-9.+-]+;base64,/i.test(s);

export const safeAtob = (input: string): string | null => {
    try {
        let s = input.replace(/-/g, '+').replace(/_/g, '/');
        while (s.length % 4) s += '=';
        const binary = atob(s);
        try {
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        } catch {
            return binary;
        }
    } catch {
        return null;
    }
};

export const sniffMimeFromBase64 = (b64: string): string => {
    try {
        const head = b64.substring(0, 24);
        const padded = head + '='.repeat((4 - (head.length % 4)) % 4);
        const binary = atob(padded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif';
        if (
            bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
            bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
        ) return 'image/webp';
        if (bytes[0] === 0x42 && bytes[1] === 0x4d) return 'image/bmp';
        const textHead = binary.substring(0, 5);
        if (textHead.startsWith('<svg') || textHead.startsWith('<?xml')) return 'image/svg+xml';
        if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) return 'image/x-icon';
    } catch {
        /* ignore */
    }
    return 'image/jpeg';
};

export const resolveImageSrc = (input: any): string => {
    if (input === undefined || input === null) return '';

    // Node.js Buffer: { type: 'Buffer', data: [137, 80, ...] }
    if (
        typeof input === 'object' &&
        !Array.isArray(input) &&
        (input.type === 'Buffer' || Array.isArray(input.data))
    ) {
        try {
            const bytes = new Uint8Array(input.data);
            let binary = '';
            const chunk = 0x8000;
            for (let i = 0; i < bytes.length; i += chunk) {
                binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
            }
            const b64 = btoa(binary);
            return `data:${sniffMimeFromBase64(b64)};base64,${b64}`;
        } catch {
            return '';
        }
    }

    // Raw byte array
    if (Array.isArray(input) && input.length > 8 && input.every((n: any) => typeof n === 'number')) {
        try {
            const bytes = new Uint8Array(input);
            let binary = '';
            const chunk = 0x8000;
            for (let i = 0; i < bytes.length; i += chunk) {
                binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
            }
            const b64 = btoa(binary);
            return `data:${sniffMimeFromBase64(b64)};base64,${b64}`;
        } catch {
            return '';
        }
    }

    // Object with a string `.data` field
    let value: any = input;
    if (typeof value === 'object' && typeof value.data === 'string') {
        value = value.data;
    }

    let s = String(value).trim();

    // Strip JSON-style surrounding quotes
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1);
    }

    // Remove whitespace/null bytes
    s = s.replace(/[\s\u0000-\u001F\u007F]/g, '');

    if (!s || s === 'null' || s === 'undefined') return '';

    // HTTP(S) / blob URLs
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:')) {
        return s;
    }

    // Direct data URL
    if (isImageDataUrl(s)) {
        const commaIdx = s.indexOf(',');
        const meta = s.substring(0, commaIdx);
        const payload = s.substring(commaIdx + 1);
        const declared = meta.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        const actual = sniffMimeFromBase64(payload);
        if (declared !== actual && declared !== 'application/octet-stream') {
            return `data:${actual};base64,${payload}`;
        }
        return s;
    }

    // KEY CASE: base64 of a data URL → decode once
    const decodedOnce = safeAtob(s);
    if (decodedOnce && isImageDataUrl(decodedOnce)) {
        return decodedOnce;
    }

    // Double-encoded base64 fallback
    if (decodedOnce && /^[A-Za-z0-9+/=]+$/.test(decodedOnce) && decodedOnce.length > 32) {
        const mime = sniffMimeFromBase64(decodedOnce);
        return `data:${mime};base64,${decodedOnce}`;
    }

    // "...,data:" outer-prefix case
    if (s.includes(',data:')) {
        const inner = s.substring(s.indexOf(',data:') + 1);
        if (isImageDataUrl(inner)) return inner;
    }

    // Fallback: treat as raw base64
    return `data:${sniffMimeFromBase64(s)};base64,${s}`;
};