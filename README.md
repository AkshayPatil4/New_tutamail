# URL Checker Application

## Overview

The URL Checker application allows users to verify the validity of a URL and check if it exists as a file or folder. Built with HTML, CSS, and TypeScript, this application features a user-friendly interface where users can input a URL and receive feedback on its validity and existence. The application simulates server responses for URL existence checks and employs throttling to manage the frequency of server requests.

## Project Structure
```plaintext
  /new_tutamail
  │
  ├── /src
  │   └── script.ts           
  ├── /dist
  │   └── script.js          
  ├── index.html              
  ├── tsconfig.json          
  └── package.json
```
## Features
- URL Validation: Validates the format of the URL using a regular expression.
- Throttled Server Check: The server check function is throttled to avoid excessive requests, but it runs immediately when the URL changes.
- Handling Changing URLs: If the URL changes while the server is checking, the old result is ignored to prevent displaying incorrect information.
- Console Logs: Added detailed console logs to trace the flow of data and the internal state at each step.

## Changes Made

1. **Immediate Validation**: The validity check is throttled to avoid excessive checks but is executed immediately when the URL changes. This was achieved by using a throttle function that allows the initial execution immediately and then limits subsequent calls.
```typescript
    // Throttle function to limit how frequently the URL check is performed.
function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
    let lastFunc: ReturnType<typeof setTimeout> | null = null;
    let lastRan: number | undefined;
    return function(this: any, ...args: any[]) {
        const context = this;
        if (!lastRan) {
            func.apply(context, args); // Executes immediately
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
```


2. **Correct Handling of Server Response**: To handle cases where the URL changes during the server check, the current URL is stored, and only the response corresponding to the latest URL is shown. If the URL changes while waiting for the server response, the old result is ignored.
```typescript
    let currentUrlBeingChecked = '';

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
            if (url === currentUrlBeingChecked) {  // Ensures result matches the current URL
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
```

3. **Added Console Logs**: To provide visibility into the internal state and the flow of execution, console logs were added at various points in the code. These logs help to trace the steps taken during URL validation and server checks.
```typescript
  function isValidUrl(url: string): boolean {
    console.log(`Validating URL format: ${url}`);
    return urlPattern.test(url);
}

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
```
These logs are particularly useful during development and debugging, allowing you to see the sequence of operations and how the application responds to different inputs.

## Installation and Setup
1. **Clone the Repository**
```bash
  git clone <repository-url>
 ```
2. **Install Dependencies**
Ensure you have Node.js installed, then run:
```bash
npm install
```
3. **Build the Project**
Compile the TypeScript code to JavaScript:
```bash
npm run build
```

4. **Run the Project**
Open the index.html file in your browser to test the functionality. You can also open the browser's Developer Tools (F12) to view the console logs and observe the behavior of the URL checker.

## Usage
1. Enter a URL: Type a URL into the input field.
2. View Logs: Open the browser's Developer Tools (F12) to see detailed logs for each step of the process.
3. Observe Results: The result of the server check will be displayed below the input field. If you change the URL before the check completes, the result will be ignored.


      
  	

