/**
 * wishlist controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::wishlist.wishlist' as any, ({ strapi }) => ({
  /**
   * Find wishlist items
   * - For API requests: Returns only the authenticated user's wishlist
   * - For admin panel: Uses default behavior (shows all items)
   */
  async find(ctx) {
    // Check if this is a Content Manager (admin panel) request
    // The admin panel uses /content-manager/ path, not /api/
    const isContentManagerRequest = ctx.request.url.includes('/content-manager/');
    
    if (isContentManagerRequest) {
      // Let the default controller handle admin panel requests
      return super.find(ctx);
    }

    // For public API requests, require authentication and filter by user
    const user = ctx.state.user;

    if (!user) {
      ctx.throw(401, 'You must be authenticated to access wishlist');
    }

    // Query only wishlist items belonging to the authenticated user
    // Properly populate product and its image relation
    const entities = await strapi.entityService.findMany('api::wishlist.wishlist' as any, {
      filters: { user: user.id },
      populate: {
        product: {
          populate: ['image'],
        },
      },
    });

    console.log('Wishlist entities found:', entities?.length || 0);
    if (entities && entities.length > 0) {
      console.log('Sample entity structure:', {
        id: entities[0].id,
        hasProduct: !!entities[0].product,
        productId: entities[0].product?.id,
        productName: entities[0].product?.name,
        productPrice: entities[0].product?.price,
        hasImage: !!entities[0].product?.image,
        imageType: Array.isArray(entities[0].product?.image) ? 'array' : typeof entities[0].product?.image,
        imageCount: Array.isArray(entities[0].product?.image) ? entities[0].product.image.length : 0
      });
    }

    // Transform entities to Strapi API format
    const transformedData = (Array.isArray(entities) ? entities : []).map(entity => {
      console.log('Processing wishlist entity:', {
        id: entity.id,
        hasProduct: !!entity.product,
        productId: entity.product?.id,
        productName: entity.product?.name,
        productPrice: entity.product?.price,
        hasImage: !!entity.product?.image,
        imageIsArray: Array.isArray(entity.product?.image)
      });

      // Handle image transformation
      let imageData = null;
      if (entity.product?.image) {
        if (Array.isArray(entity.product.image)) {
          imageData = entity.product.image.map(img => ({
            id: img.id,
            attributes: {
              url: img.url,
              name: img.name,
              alternativeText: img.alternativeText,
              width: img.width,
              height: img.height,
            }
          }));
        } else {
          imageData = {
            id: entity.product.image.id,
            attributes: {
              url: entity.product.image.url,
              name: entity.product.image.name,
              alternativeText: entity.product.image.alternativeText,
              width: entity.product.image.width,
              height: entity.product.image.height,
            }
          };
        }
      }

      return {
        id: entity.id,
        attributes: {
          addedAt: entity.addedAt,
          product: {
              data: entity.product ? {
                id: entity.product.id,
                attributes: {
                  name: entity.product.name,
                  price: entity.product.price,
                  category: entity.product.category,
                  inStock: entity.product.inStock,
                  inventory: entity.product.inventory,
                  image: imageData ? { data: imageData } : null,
                }
              } : null,
            },
          },
        };
      });

    console.log('Transformed wishlist data:', JSON.stringify(transformedData, null, 2));

    return { data: transformedData };
  },

  /**
   * Find one wishlist item (only if it belongs to the authenticated user)
   */
  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      ctx.throw(401, 'You must be authenticated to access wishlist');
    }

    const entity: any = await strapi.entityService.findOne('api::wishlist.wishlist' as any, id, {
      populate: {
        user: true,
        product: {
          populate: ['image'],
        },
      },
    });

    if (!entity) {
      ctx.throw(404, 'Wishlist item not found');
    }

    // Handle both direct ID and nested user object
    const entityUserId = entity.user?.id || entity.user;
    if (entityUserId !== user.id) {
      ctx.throw(403, 'You can only access your own wishlist items');
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    
    return this.transformResponse(sanitizedEntity);
  },

  /**
   * Create a wishlist item for the authenticated user
   */
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      ctx.throw(401, 'You must be authenticated to create wishlist items');
    }

    // Ensure the user field is set to the authenticated user
    const data = {
      ...ctx.request.body.data,
      user: user.id,
      addedAt: new Date(),
    };

    const entity = await strapi.entityService.create('api::wishlist.wishlist' as any, {
      data,
      populate: {
        product: {
          populate: ['image'],
        },
      },
    });

    // Handle image transformation
    let imageData = null;
    if (entity.product?.image) {
      if (Array.isArray(entity.product.image)) {
        imageData = entity.product.image.map(img => ({
          id: img.id,
          attributes: {
            url: img.url,
            name: img.name,
            alternativeText: img.alternativeText,
            width: img.width,
            height: img.height,
          }
        }));
      } else {
        imageData = {
          id: entity.product.image.id,
          attributes: {
            url: entity.product.image.url,
            name: entity.product.image.name,
            alternativeText: entity.product.image.alternativeText,
            width: entity.product.image.width,
            height: entity.product.image.height,
          }
        };
      }
    }

    // Transform to Strapi API format
    const transformedData = {
      id: entity.id,
      attributes: {
        addedAt: entity.addedAt,
        product: {
          data: entity.product ? {
            id: entity.product.id,
            attributes: {
              name: entity.product.name,
              price: entity.product.price,
              category: entity.product.category,
              inStock: entity.product.inStock,
              inventory: entity.product.inventory,
              image: imageData ? { data: imageData } : null,
            }
          } : null,
        },
      },
    };
    
    return { data: transformedData };
  },

  /**
   * Update a wishlist item (only if it belongs to the authenticated user)
   */
  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      ctx.throw(401, 'You must be authenticated to update wishlist items');
    }

    // Check if the wishlist item exists and belongs to the user
    const existingEntity: any = await strapi.entityService.findOne('api::wishlist.wishlist' as any, id, {
      populate: ['user'],
    });

    if (!existingEntity) {
      ctx.throw(404, 'Wishlist item not found');
    }

    // Handle both direct ID and nested user object
    const entityUserId = existingEntity.user?.id || existingEntity.user;
    if (entityUserId !== user.id) {
      ctx.throw(403, 'You can only update your own wishlist items');
    }

    // Update the entity
    const entity = await strapi.entityService.update('api::wishlist.wishlist' as any, id, {
      data: ctx.request.body.data,
      populate: {
        product: {
          populate: ['image'],
        },
      },
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    
    return this.transformResponse(sanitizedEntity);
  },

  /**
   * Delete a wishlist item (only if it belongs to the authenticated user)
   */
  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      ctx.throw(401, 'You must be authenticated to delete wishlist items');
    }

    // Check if the wishlist item exists and belongs to the user
    const existingEntity: any = await strapi.entityService.findOne('api::wishlist.wishlist' as any, id, {
      populate: ['user'],
    });

    if (!existingEntity) {
      ctx.throw(404, 'Wishlist item not found');
    }

    // Handle both direct ID and nested user object
    const entityUserId = existingEntity.user?.id || existingEntity.user;
    if (entityUserId !== user.id) {
      ctx.throw(403, 'You can only delete your own wishlist items');
    }

    // Delete the entity
    await strapi.entityService.delete('api::wishlist.wishlist' as any, id);

    // Return success response
    ctx.body = {
      data: {
        id: parseInt(id),
        attributes: {
          addedAt: existingEntity.addedAt,
          createdAt: existingEntity.createdAt,
          updatedAt: existingEntity.updatedAt,
        }
      },
      meta: {}
    };
  },
}));
