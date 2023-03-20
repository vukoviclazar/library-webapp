import multer from 'multer'

const uploadAvatarConfig = multer({ 
    storage : multer.diskStorage({
        destination: (req, file, cb) => {
            console.log('destination avatar')
             cb(null, './images/avatars')
            },
        filename: (req, file, cb) => {
            console.log(file)
            console.log(req.files)
            console.log('filename avatar ' + file.fieldname)
            cb(null, file.fieldname)
        }
    })
}).any()

export function uploadAvatar(req, res, next) {
    uploadAvatarConfig(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error(`Multer error while uploading: ${err}`)
        } else if (err) {
            console.error(`Unknown error while uploading: ${err}`)
        }
        next()
    })
}


const uploadCoverConfig = multer({ 
    storage : multer.diskStorage({
        destination: (req, file, cb) => {
            console.log('destination cover')
             cb(null, './images/covers')
            },
        filename: (req, file, cb) => {
            console.log(file)
            console.log(req.files)
            console.log('filename cover ' + file.fieldname)
            cb(null, file.fieldname)
        }
    })
}).any()

export function uploadCover(req, res, next) {
    uploadCoverConfig(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error(`Multer error while uploading: ${err}`)
        } else if (err) {
            console.error(`Unknown error while uploading: ${err}`)
        }
        next()
    })
}