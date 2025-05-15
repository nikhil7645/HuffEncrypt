class HuffmanNode {
    constructor(char, freq) {
        this.char = char;
        this.freq = freq;
        this.left = null;
        this.right = null;
    }
}

function binaryStringToByteArray(binaryString) {
    let byteArray = [];
    for (let i = 0; i < binaryString.length; i += 8) {
        let byte = binaryString.slice(i, i + 8);
        byteArray.push(parseInt(byte, 2));
    }
    return new Uint8Array(byteArray); 
}

function buildFrequencyTable(data) {
    let frequency = {};
    for (let char of data) {
        if (!frequency[char]) {
            frequency[char] = 0;
        }
        frequency[char]++;
    }
    return frequency;
}

function buildHuffmanTree(frequency) {
    let priorityQueue = [];
    for (let char in frequency) {
        priorityQueue.push(new HuffmanNode(char, frequency[char]));
    }
    priorityQueue.sort((a, b) => a.freq - b.freq);

    while (priorityQueue.length > 1) {
        let left = priorityQueue.shift();
        let right = priorityQueue.shift();
        let newNode = new HuffmanNode(null, left.freq + right.freq);
        newNode.left = left;
        newNode.right = right;
        priorityQueue.push(newNode);
        priorityQueue.sort((a, b) => a.freq - b.freq);
    }
    return priorityQueue[0];
}

function generateCodes(root, currentCode = "", codes = {}) {
    if (!root) return;

    if (root.char !== null) {
        codes[root.char] = currentCode;
    }

    generateCodes(root.left, currentCode + "0", codes);
    generateCodes(root.right, currentCode + "1", codes);

    return codes;
}

function huffmanCompress(data) {
    let frequency = buildFrequencyTable(data);
    let huffmanTree = buildHuffmanTree(frequency);
    let huffmanCodes = generateCodes(huffmanTree);

    let encodedData = "";
    for (let char of data) {
        encodedData += huffmanCodes[char];
    }

    return { encodedData, huffmanCodes };
}

function calculateSizeReduction(originalData, encodedData) {
    let originalSize = originalData.length * 8; 
    let compressedSize = encodedData.length; 
    let reductionPercentage = ((originalSize - compressedSize) / originalSize) * 100;
    return reductionPercentage;
}

function downloadCompressedFile(data, filename) {
    const byteArray = binaryStringToByteArray(data);

    const blob = new Blob([byteArray], { type: 'application/octet-stream' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
}

 

function compressFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload a file first.');
        return;
    }
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    document.querySelector('.progress-bar-container').style.display = 'block';
    progressText.style.display = 'block';

    progressBar.style.width = '0%';
    progressPercent.textContent = '0';

    
    let progress = 0;
    const compressionDuration = 3000; 
    const intervalDuration = 100; 
    const increment = (intervalDuration / compressionDuration) * 100; 

    const interval = setInterval(() => {
        if (progress >= 100) {
            progress = 100; 
            clearInterval(interval);

            
            const reader = new FileReader();
            reader.onload = function(event) {
                const data = event.target.result;

                const { encodedData } = huffmanCompress(data);
                const reduction = calculateSizeReduction(data, encodedData);

               
                const originalSizeMB = (data.length / (1024 * 1024)).toFixed(2);
                const compressedSizeMB = (encodedData.length / 8 / (1024 * 1024)).toFixed(2); 

                document.getElementById('result').innerHTML = `
                    <p>Original Size: ${originalSizeMB} MB</p>
                    <p>Compressed Size: ${compressedSizeMB} MB</p>
                    <p>Size Reduced by: ${reduction.toFixed(2)}%</p>
                    <button id="downloadButton">Download Compressed File</button>
                `;

                document.getElementById('downloadButton').addEventListener('click', () => {
                    downloadCompressedFile(encodedData, 'compressed.bin');
                });
            };

            reader.readAsText(file);
        } else {
            progress += increment; 
            if (progress > 100) progress = 100; 
            progressBar.style.width = progress + '%';
            progressPercent.textContent = Math.floor(progress);
        }
    }, intervalDuration);
    document.getElementById('result').classList.add('show');
    reader.readAsText(file);
}
