/**
 * Places repository
 * @singleton
 */


const Repository = require('./../../core/Repository');
const PlacesModel = require('./../models/placesModel');
const imagesRepository = require('./imagesRepository');

const placesRepository = new Repository({

    /**
     * get by {id}
     * @param {number} id
     * @param {number=} receiverId - prepare record for this user
     * @return {Promise<?(PlacesModel|PlacesData)>}
     */
    getById(id, receiverId) {
        if (!isFinite(id)) {
            return Promise.resolve(null);
        }

        return PlacesModel.findById(id)
                .then((place) => {
                if (place !== null && receiverId) {
            return this._prepareRecordForUser(place, receiverId);
        }

        return place;
    });
    },

    /**
     * create
     * - create record
     * - upload image if received
     * @param {PlacesDataInput} inputData
     * @param {Object=} transaction
     * @return {Promise<PlacesModel>}
     */
    create(inputData, transaction) {
        let writeData = this._prepareWriteData(inputData);
        const place = PlacesModel.build(writeData);

        return place.save({transaction})
                .then(() => {
                if (inputData.image) {
            return this._uploadImage(inputData.image, writeData.image, PlacesModel.imageParams);
        }
    })
    .then(() => place);
    },

    /**
     * update
     * - get record
     * - update record
     * - upload image if received
     * @param {number} id
     * @param {PlacesDataInput} inputData
     * @param {Object} transaction
     * @return {Promise<?PlacesModel>} place
     */
    update(id, inputData, transaction) {
        if (!isFinite(id)) {
            return Promise.resolve(null);
        }

        let writeData;
        let place;

        return this.getById(id)
            .then((foundPlace) => {
            place = foundPlace;
        if (place === null) {
            return;
        }
        writeData = this._prepareWriteData(inputData, place);

        return place.update(writeData, {transaction});
    })
    .then(() => {
            if (place && inputData.image) {
            return this._uploadImage(inputData.image, writeData.image, PlacesModel.imageParams);
        }
    })
    .then(() => place);
    },

    /**
     * remove
     * - get record
     * - remove record
     * - remove image if exists
     * @param {number} id
     * @param {Object=} transaction
     * @return {Promise<boolean>}
     */
    remove(id, transaction) {
        if (!isFinite(id)) {
            return Promise.resolve(null);
        }

        let place;

        return this.getById(id)
            .then((foundPlace) => {

            place = foundPlace;
        if (place === null) {
            return;
        }

        return place.destroy({transaction});
    })
    .then(() => {
            if (!place) {
            return false;
        }

        if (place.image) {
            imagesRepository.remove(place.image, PlacesModel.imageParams);
        }

        return true;
    });
    },

    /**
     * upload place image
     * @param {File} file
     * @param {string} name
     * @param {ImageParams} params
     * @return {Promise}
     */
    _uploadImage(file, name, params) {

        return imagesRepository.add(file, Object.assign({name}, params));
    }

});

module.exports = placesRepository;