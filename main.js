// Main Application Logic
document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const canvas = document.getElementById("barcodeCanvas");
    const barcodeText = document.getElementById("barcodeText");
    const barcodeType = document.getElementById("barcodeType");
    const barHeight = document.getElementById("barHeight");
    const heightVal = document.getElementById("heightVal");
    const heightGroup = document.getElementById("heightGroup");
    const includeText = document.getElementById("includeText");
    const bgColor = document.getElementById("bgColor");
    const barColor = document.getElementById("barColor");
    const bgGroup = document.getElementById("bgGroup");
    const barColorGroup = document.getElementById("barColorGroup");
    const downloadBtn = document.getElementById("downloadBtn");
    const errorMsg = document.getElementById("error-msg");

    // debounce timer
    let debounceTimer;

    // Config
    const is2D = (type) => {
        const twoDTypes = ['qrcode', 'datamatrix', 'pdf417', 'azteccode'];
        return twoDTypes.includes(type);
    };

    const updateVisibility = () => {
        const type = barcodeType.value;
        if (is2D(type)) {
            // 2D: Enable Colors, Disable Height
            heightGroup.style.opacity = "0.5";
            heightGroup.style.pointerEvents = "none";
            barHeight.disabled = true;

            bgGroup.style.opacity = "1";
            bgGroup.style.pointerEvents = "auto";
            bgColor.disabled = false;

            barColorGroup.style.opacity = "1";
            barColorGroup.style.pointerEvents = "auto";
            barColor.disabled = false;
        } else {
            // 1D: Enable Height, Disable Colors
            heightGroup.style.opacity = "1";
            heightGroup.style.pointerEvents = "auto";
            barHeight.disabled = false;

            bgGroup.style.opacity = "0.5";
            bgGroup.style.pointerEvents = "none";
            bgColor.disabled = true;

            barColorGroup.style.opacity = "0.5";
            barColorGroup.style.pointerEvents = "none";
            barColor.disabled = true;
        }
    };

    const generateBarcode = () => {
        const text = barcodeText.value.trim();
        const type = barcodeType.value;
        const scaleValue = parseInt(scale.value);
        const heightValue = parseInt(barHeight.value);
        const includeTextValue = includeText.checked;
        let bgColorHex = 'FFFFFF';
        let barColorHex = '000000';

        if (is2D(type)) {
            bgColorHex = bgColor.value.substring(1); // Remove #
            barColorHex = barColor.value.substring(1); // Remove #
        }

        if (!text) {
            // Optional: clear canvas or show empty state
            // But usually nice to leave last valid or show placeholder
            // allowing empty generation usually throws error in bwip
            return;
        }

        // Reset error
        errorMsg.classList.add('hidden');
        errorMsg.textContent = '';
        canvas.style.opacity = '0.5';

        try {
            let options = {
                bcid: type,       // Barcode type
                text: text,       // Text to encode
                scale: scaleValue,       // 3x scaling factor
                includetext: includeTextValue, // Show human-readable text
                textxalign: 'center', // Always good for 1D
                padding: 10, // Add margin around the barcode
                backgroundcolor: bgColorHex,
                barcolor: barColorHex
            };

            // Height handling
            if (!is2D(type)) {
                // bwip-js height is relative to bar width usually, 
                // but let's try to pass it as height in mm or just a factor if possible.
                // bwip-js documentation says `height` is bar height in millimeters (default approx 10-15??)
                // Let's coerce it to something reasonable. 
                // The slider is 10-150.
                options.height = heightValue;
            }

            // Call bwip-js
            bwipjs.toCanvas(canvas, options, function (err, cvs) {
                canvas.style.opacity = '1';
                if (err) {
                    console.error("BWIP-JS Error:", err);
                    errorMsg.textContent = "Error: " + (err.message || err);
                    errorMsg.classList.remove('hidden');
                } else {
                    // Success
                }
            });
        } catch (e) {
            console.error("Generation Error:", e);
            errorMsg.textContent = "Generation failed: " + e.message;
            errorMsg.classList.remove('hidden');
            canvas.style.opacity = '1';
        }
    };

    // Event Listeners
    const inputs = [barcodeText, barcodeType, barHeight, scale, includeText, bgColor, barColor];

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            // Update value displays
            heightVal.textContent = barHeight.value;
            scaleVal.textContent = scale.value;

            // Logic updates
            updateVisibility();

            // Debounce generation for text input
            if (input === barcodeText) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(generateBarcode, 300);
            } else {
                generateBarcode();
            }
        });
    });

    // Download
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `barcode-${barcodeText.value || 'gen'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Initial run
    updateVisibility();
    generateBarcode();
});
