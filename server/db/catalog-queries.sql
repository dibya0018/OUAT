-- Example usage via stored procedures (phpMyAdmin → SQL)
-- Procedures are installed by npm run db:migrate

CALL sp_catalog_counts();

CALL sp_collections_list();

CALL sp_products_list('', 0, '', 0, '');
-- params: collection, featured_only, search, include_inactive, comma-separated ids

CALL sp_products_list('glassware', 0, '', 0, '');

CALL sp_product_by_slug('tall-tumbler-set');

CALL sp_product_by_id('p-001');

CALL sp_product_images_by_product_ids('p-001,p-002');

-- Seed / admin writes (used by npm run db:seed)
-- CALL sp_collection_upsert(...);
-- CALL sp_product_upsert(...);
-- CALL sp_product_images_delete_for_product('p-001');
-- CALL sp_product_image_insert(...);
