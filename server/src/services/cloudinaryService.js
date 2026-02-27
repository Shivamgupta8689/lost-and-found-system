import cloudinary from '../config/cloudinary.js'

export const uploadImage = (fileBuffer, folder = 'campus-lost-found') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(fileBuffer)
  })
}

export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Failed to delete image:', error.message)
  }
}
