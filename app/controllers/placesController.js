/**
 * Places controller
 * @singleton
 */

const Controller = require('./../../core/Controller');
const placesService = require('./../services/placesService');

const placesController = new Controller({

    /**
     * example get-request
     * /api/places/:id
     * @param {Request} req
     * @param {Response} res
     * @return {Promise}
     */
    getOne(req, res) {

        return this.checkIdFromUrl(req)
            .then((id) => {
                return placesService.getOne(id, req.session);
            })
            .then((data) => {
                res.send(data);
            });
    },

    /**
     * example post-request
     * /api/places
     * @param {Request} req
     * @param {Response} res
     * @return {Promise}
     */
    postAction(req, res) {

        return placesService.addNew(req.body, req.session)
            .then((data) => {
                res.send(data);
            });
    },

    /**
     * example patch-request
     * /api/places/:id
     * @param {Request} req
     * @param {Response} res
     * @return {Promise}
     */
    patchAction(req, res) {

        return this.checkIdFromUrl(req)
            .then((id) => {
                return placesService.update(id, req.body, req.session);
            })
            .then((data) => {

                res.send(data);
            });
    },

    /**
     * example delete-request
     * /api/places/:id
     * @param {Request} req
     * @param {Response} res
     * @return {Promise}
     */
    deleteAction(req, res) {

        return this.checkIdFromUrl(req)
            .then((id) => {
                return placesService.remove(id, req.session);
            })
            .then(() => {
                res.status(200).end();
            });
    }
});

module.exports = placesController;