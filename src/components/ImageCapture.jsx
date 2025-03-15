import React, { useState, useEffect } from "react";

const ImageUploadComponent = ({
  onImageChange,
  onImageRemove,
  image,
  currentImagePath,
  isImageRemoved,
  isNewEntryForm,
  isEditForm,
}) => {
  const [previewImage, setPreviewImage] = useState(null);

  // Effect to update preview image when `image` or `currentImagePath` changes
  useEffect(() => {
    let objectUrl = null;

    if (image && image instanceof Blob) {
      objectUrl = URL.createObjectURL(image);
      setPreviewImage(objectUrl);
    } else if (currentImagePath) {
      setPreviewImage(currentImagePath);
    } else {
      setPreviewImage(null);
    }

    // Cleanup the object URL on unmount or when image changes
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [image, currentImagePath]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file instanceof Blob) {
      onImageChange(file); // Notify parent component with the selected file
    } else {
      console.error("Invalid file selected.");
    }
  };

  const handleImageRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImage(null); // Clear the preview locally
    onImageRemove(); // Notify parent to remove the image
  };

  return (
    <div className="image-upload-section">
      {/* Image upload for new entry form */}
      {isNewEntryForm && (
        <>
          <label>Upload Image:</label>
          <input type="file" className="image-upload" onChange={handleImageChange} />
          {previewImage && !isImageRemoved && (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={previewImage}
                alt="Uploaded Preview"
                className="image-preview"
                
              />
              <button className="remove-image-cross" onClick={handleImageRemoveClick}>
                &times;
              </button>
            </div>
          )}
        </>
      )}

      {/* Image upload for edit form */}
      {isEditForm && (
        <>
          <label>Upload Image:</label>
          <input type="file" className="image-upload" onChange={handleImageChange} />
          {isImageRemoved ? (
            <p>No image available</p>
          ) : (
            previewImage && (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={previewImage}
                  alt="Preview or Previous Image"
                  className="image-preview"
                  
                />
                <button className="remove-image-cross" onClick={handleImageRemoveClick}>
                  &times;
                </button>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default ImageUploadComponent;
