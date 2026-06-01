import multer from "multer";

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "./public");

    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() +
            "-" +
            file.originalname
        );

    }

});

export const upload = multer({

    storage,

    limits: {

        fileSize:
            20 * 1024 * 1024

    }

});