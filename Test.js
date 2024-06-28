document.addEventListener('DOMContentLoaded', function() {
    const captureImageButton = document.getElementById('captureImageButton');
    const fileInput = document.getElementById('fileInput');

    captureImageButton.addEventListener('click', function() {
        const useCamera = confirm("Do you want to capture the image using the camera?");
        if (useCamera) {
            fileInput.setAttribute('capture', 'environment');
        } else {
            fileInput.removeAttribute('capture');
        }
        fileInput.click();
    });

    fileInput.addEventListener('change', function(event) {
        const files = event.target.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgData = e.target.result;
                // Do something with the image data, like displaying or uploading
                console.log('Image data:', imgData);
            };
            reader.readAsDataURL(file);
        }
    });
});
