/**
 * image helper
 * @singleton
 */

/**
 * params for stored image
 * @typedef {Object} ImageParams
 * @property {string=} name
 * @property {string[]} sizes - one or more from ['xs', 'sm', 'md', 'lg']
 * @property {boolean=} original - need to store original image
 */

/**
 * urls of stored image
 * @typedef {Object} ImageObject
 * @property {string=} xs
 * @property {string=} sm
 * @property {string=} md
 * @property {string=} lg
 * @property {string=} o
 */

const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true});

const QUALITY = 65;
const IMAGES_DIRECTORY = __dirname + '/../images/';

/**
 * sizes for image
 * x-small - 50x50
 * small - 100x100
 * medium - 200x200
 * large - 400x400
 * @var {Object} SIZE_NAMES
 */
const SIZE_NAMES = {
    xs: 50,
    sm: 100,
    md: 200,
    lg: 400
};

const imageHelper = {

    /**
     * crop the image to make it square on the side of the minimum
     * @param {Object} info
     * @param {{number, number}} info.size
     * @param {File} image
     * @param {ImageParams} params
     * @return {Promise<{imagePath: string, originalPath: string, params: Object}>}
     */
    crop({info, image, params}) {
        return new Promise((resolve, reject) => {
            if (info.size.width !== info.size.height) {
                const minValue = Math.min(info.size.width, info.size.height);
                gm(image.path)
                    .crop(minValue, minValue, 0, 0)
                    .write(`${IMAGES_DIRECTORY}${params.name}.jpg`, (err) => {
                        if (err) return reject(err);
                        resolve({
                            imagePath: `${IMAGES_DIRECTORY}${params.name}.jpg`,
                            originalPath: image.path,
                            params: params
                        });
                    });
            } else {
                resolve({imagePath: image.path, originalPath: image.path, params: params});
            }
        })
    },

    /**
     * get image info
     * @param {File} image
     * @param {ImageParams} params
     * @return {Promise<{info: {Object}, image: File, params: Object}>}
     */
    getInfo (image, params) {

        return new Promise((resolve, reject) => {
            gm(image.path).identify((err, data) => {
                if (err) return reject(err);
                resolve({info: data, image: image, params: params})
            });
        });
    },

    /**
     * read image file content
     * @param {File} image
     * @return {Promise<{image: File, body: buffer}>}
     */
    readFile(image) {
        return new Promise((resolve, reject) => {
            fs.readFile(image.path, (err, data) => {
                if (err) return reject(err);
                resolve({image: image, body: data});
            })
        })
    },

    /**
     * remove local image file
     * @param {Object} image
     * @param {string} image.path
     * @param {string} image.name
     * @return {Promise<string>} image name
     */
    removeLocalFile(image) {
        return new Promise((resolve, reject) => {
            fs.unlink(image.path, (err) => {
                if (err) return reject(err);
                resolve(image.name);
            });
        });
    },

    /**
     * resize image
     * @param {string} imagePath
     * @param {string} originalPath
     * @param {ImageParams} params
     * @return {Promise<{path: string, name: string}[]>} array of paths and names of resized images
     */
    resize({imagePath, originalPath, params}) {
        const imageProcesses = params.sizes.map((size) => {
            const path = `${IMAGES_DIRECTORY}${params.name}_${size}.jpg`;

            return new Promise((resolve, reject) => {
                gm(imagePath)
                    .resize(SIZE_NAMES[size], SIZE_NAMES[size])
                    .interlace('Plane')
                    .quality(QUALITY)
                    .write(path, (err) => {
                        if (err) return reject(err);
                        resolve({path: path, name: `${params.name}_${size}.jpg`});
                    });
            });

        });
        if (params.original) {
            const path = `${IMAGES_DIRECTORY}${params.name}.jpg`;

            imageProcesses.push(new Promise((resolve, reject) => {
                gm(originalPath)
                    .interlace('Plane')
                    .quality(QUALITY)
                    .write(path, (err) => {
                        if (err) return reject(err);
                        resolve({path: path, name: `${params.name}.jpg`});
                    });
            }));
        }

        return Promise.all(imageProcesses)
            .then((images) => {
                if (!params.original && imagePath !== originalPath) {
                    imageHelper.removeLocalFile({path: imagePath});
                    imageHelper.removeLocalFile({path: originalPath});
                } else if (params.original && (imagePath !== originalPath)
                    || !params.original && (imagePath === originalPath)) {
                    imageHelper.removeLocalFile({path: originalPath});
                }

                return images;
            });
    }
};

module.exports = imageHelper;