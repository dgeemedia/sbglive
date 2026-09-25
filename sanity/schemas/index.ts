// sanity/schemas/index.ts
// RECONSTRUCTED — wires the schema files together for sanity.config.ts.
// If your project already has a different registry file (e.g. schemaTypes/index.ts), just make
// sure it includes siteSettings and the updated product schema instead of using this one.
import product from './product'
import order from './order'
import siteSettings from './siteSettings'

export const schemaTypes = [product, order, siteSettings]
