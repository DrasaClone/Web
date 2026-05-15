/**
 * Cloudinary Service for handling image uploads
 */
const CLOUDINARY_CONFIG = {
    cloudName: 'dgbux4wzo',
    uploadPreset: 'okeqfdx4'
};

export const CloudinaryService = {
    /**
     * Upload an image to Cloudinary
     * @param {string} base64Data - The image data in base64 format
     * @returns {Promise<string>} - The URL of the uploaded image
     */
    async uploadImage(base64Data) {
        const formData = new FormData();
        formData.append('file', base64Data);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    }
};
