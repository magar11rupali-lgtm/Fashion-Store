/**
 * wishlist router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::wishlist.wishlist' as any, {
  config: {
    find: {
      policies: ['api::wishlist.is-authenticated'],
    },
    findOne: {
      policies: ['api::wishlist.is-authenticated'],
    },
    create: {
      policies: ['api::wishlist.is-authenticated'],
    },
    update: {
      policies: ['api::wishlist.is-authenticated'],
    },
    delete: {
      policies: ['api::wishlist.is-authenticated'],
    },
  },
});
