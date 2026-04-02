/**
 * `is-authenticated` policy
 * Ensures the user is authenticated before accessing wishlist endpoints
 * Allows admin users to access via Content Manager
 */

export default (policyContext, config, { strapi }) => {
  // Allow admin users (they have ctx.state.admin set)
  if (policyContext.state.admin) {
    return true;
  }

  // Allow authenticated regular users
  if (policyContext.state.user) {
    return true;
  }

  // User is not authenticated, deny access
  return false;
};
