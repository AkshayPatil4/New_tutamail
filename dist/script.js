"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Regular expression for validating the format of the URL.
const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/i;
function isValidUrl(url) {
    console.log(`Validating URL format: ${url}`);
    return urlPattern.test(url);
}
// Mock server function to simulate checking the URL.
function mockServerCheck(url) {
    console.log(`Starting mock server check for: ${url}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const exists = Math.random() > 0.5;
            const isFile = Math.random() > 0.5;
            console.log(`Mock server response for ${url}: exists=${exists}, type=${isFile ? 'File' : 'Folder'}`);
            resolve({
                exists,
                type: exists ? (isFile ? 'File' : 'Folder') : 'Not Found'
            });
        }, 1000);
    });
}
// Throttle function to limit how frequently the URL check is performed.
function throttle(func, limit) {
    let lastFunc = null;
    let lastRan;
    return function (...args) {
        const context = this;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        }
        else {
            if (lastFunc) {
                clearTimeout(lastFunc);
            }
            lastFunc = setTimeout(function () {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}
let currentUrlBeingChecked = '';
const input = document.getElementById('urlInput');
const resultDiv = document.getElementById('result');
const checkUrl = throttle((url) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Throttle check initiated for URL: ${url}`);
    if (isValidUrl(url)) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        resultDiv.textContent = 'Checking URL...';
        currentUrlBeingChecked = url;
        console.log(`Current URL being checked: ${currentUrlBeingChecked}`);
        try {
            const response = yield mockServerCheck(url);
            if (url === currentUrlBeingChecked) {
                console.log(`Displaying result for URL: ${url}`);
                if (response.exists) {
                    resultDiv.textContent = `URL exists and is a ${response.type}.`;
                }
                else {
                    resultDiv.textContent = 'URL does not exist.';
                }
            }
            else {
                console.log(`URL has changed during check. Ignoring result for: ${url}`);
            }
        }
        catch (error) {
            if (url === currentUrlBeingChecked) {
                resultDiv.textContent = 'Error checking URL.';
            }
        }
    }
    else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        resultDiv.textContent = 'Invalid URL format.';
    }
}), 1000);
input.addEventListener('input', (event) => {
    const target = event.target;
    console.log(`Input event detected. URL: ${target.value}`);
    if (isValidUrl(target.value)) {
        input.classList.remove('invalid');
        input.classList.add('valid');
    }
    else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        resultDiv.textContent = 'Invalid URL format.';
        return;
    }
    checkUrl(target.value);
});
