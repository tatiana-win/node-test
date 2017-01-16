/**
 * Places service
 * @singleton
 */

const Exception = require('./../../core/Exception');
const placesRepository = require('./../repositories/placesRepository');
const Service = require('./../../core/Service');

const placesService = new Service({

    /**
     * get place by {id}
     * @param {number} id
     * @param {Session} session
     * @return {Promise<PlacesData>}
     */
    getOne(id, session) {
        const authUserId = this.getAuthUserId(session);

        return placesRepository.getById(id, authUserId)
            .then((place) => {
                if (place === null) {
                    throw new Exception(404, null, {entity: 'Place', value: id});
                }

                return place;
            });
    },

    /**
     * add new place
     * @param {PlacesDataInput} placeData
     * @param {Session} session
     * @return {Promise<PlacesModel>}
     */
    addNew(placeData, session) {

        return this.checkAdmin(session)
            .then(() => {
                return this.createTransaction((transaction) => {
                    return placesRepository.create(placeData, transaction);
                })
            });
    },

    /**
     * update place
     * @param {number} id
     * @param {PlacesDataInput} placeData
     * @param {Session} session
     * @return {Promise<(PlacesModel)>}
     */
    update(id, placeData, session) {

        return this.checkAdmin(session)
            .then(() => {

                return this.createTransaction((transaction) => {
                    return placesRepository.update(id, placeData, transaction)
                        .then((place) => {

                            if (place === null) {
                                throw new Exception(404, null, {entity: 'Place', value: id});
                            }

                            return place;
                        })

                });
            });
    },

    /**
     * remove place
     * @param {number} id
     * @param {Session} session
     * @return {Promise}
     */
    remove(id, session) {

        return this.checkAdmin(session)

            .then(() => {
                return placesRepository.remove(id);
            })
            .then((success) => {
                if (!success) {
                    throw new Exception(404, null, {entity: 'Place', value: id});
                }
            });
    }
});

module.exports = placesService;