// Interface to type-check the response from the mock server function.
interface ServerResponse {
    exists: boolean;
    type: 'File' | 'Folder' | 'Not Found';
}

// Regular expression for validating the format of the URL.
const urlPattern: RegExp = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/i;

function isValidUrl(url: string): boolean {
    console.log(`Validating URL format: ${url}`);
    return urlPattern.test(url);
}

// Mock server function to simulate checking the URL.
function mockServerCheck(url: string): Promise<ServerResponse> {
    console.log(`Starting mock server check for: ${url}`);
    return new Promise<ServerResponse>((resolve) => {
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
function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
    let lastFunc: ReturnType<typeof setTimeout> | null = null;
    let lastRan: number | undefined;
    return function(this: any, ...args: any[]) {
        const context = this;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            if (lastFunc) {
                clearTimeout(lastFunc);
            }
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan!) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    } as T;
}

let currentUrlBeingChecked = '';

const input = document.getElementById('urlInput') as HTMLInputElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;

const checkUrl = throttle(async (url: string) => {
    console.log(`Throttle check initiated for URL: ${url}`);
    if (isValidUrl(url)) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        resultDiv.textContent = 'Checking URL...';
        currentUrlBeingChecked = url;
        console.log(`Current URL being checked: ${currentUrlBeingChecked}`);

        try {
            const response = await mockServerCheck(url);
            if (url === currentUrlBeingChecked) {
                console.log(`Displaying result for URL: ${url}`);
                if (response.exists) {
                    resultDiv.textContent = `URL exists and is a ${response.type}.`;
                } else {
                    resultDiv.textContent = 'URL does not exist.';
                }
            } else {
                console.log(`URL has changed during check. Ignoring result for: ${url}`);
            }
        } catch (error) {
            if (url === currentUrlBeingChecked) {
                resultDiv.textContent = 'Error checking URL.';
            }
        }
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        resultDiv.textContent = 'Invalid URL format.';
    }
}, 1000);

input.addEventListener('input', (event: Event) => {
    const target = event.target as HTMLInputElement;
    console.log(`Input event detected. URL: ${target.value}`);

    if (isValidUrl(target.value)) {
        input.classList.remove('invalid');
        input.classList.add('valid');
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        resultDiv.textContent = 'Invalid URL format.';
        return;
    }

    checkUrl(target.value);
});
