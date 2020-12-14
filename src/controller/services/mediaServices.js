
import { Axios } from "./axios"
import { HOST_API, MEDIA_UPLOAD, MEDIA_DOWNLOAD  } from '../api'

function uploadFiles(media) {
  let config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': "application/x-www-form-urlencoded"
    }
  }
  let formData = new FormData()
  let documents = media.documents

  // let images = media.images
  // let videos = media.videos
  // for (const image of images) {
  //   let name = ''
  //   if (PLATFORM_ANDROID)
  //     name = image.image.uri.split("/")[image.image.uri.split("/").length - 1]
  //   if (PLATFORM_IOS) {
  //     name = image.image.uri.split("/")[2]
  //     name += '.JPG'
  //   }
  //   formData.append('images', { uri: image.image.uri, type: image.type, name: name })
  // }
  // for (const video of videos) {
  //   let name = ''
  //   if (PLATFORM_ANDROID)
  //     name = video.image.uri.split("/")[video.image.uri.split("/").length - 1]
  //   if (PLATFORM_IOS) {
  //     name = video.image.uri.split("/")[2] || new Date().getTime()
  //     name += '.mp4'
  //   }
  //   formData.append('videos', { uri: video.image.uri, type: video.type, name: name })
  // }
  for (const document of documents) {
    formData.append('documents', document)
  }

  return Axios('post', `${HOST_API}${MEDIA_UPLOAD}`, formData, config)
}

function downloadFiles(filename) {
  return Axios('get', `${HOST_API}${MEDIA_DOWNLOAD}?q=${filename}`)
}

export { uploadFiles, downloadFiles }