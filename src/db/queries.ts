export const productQueries = {
  list: `
    SELECT id_product, de_product, im_product, pr_product, st_product
    FROM product
    ORDER BY id_product DESC
  `,
  getById: `
    SELECT id_product, de_product, im_product, pr_product, st_product
    FROM product
    WHERE id_product = $1
  `,
  create: `
    INSERT INTO product (de_product, im_product, pr_product, st_product)
    VALUES ($1, $2, $3, $4)
    RETURNING id_product, de_product, im_product, pr_product, st_product
  `,
  update: `
    UPDATE product
    SET de_product = COALESCE($1, de_product),
        im_product = COALESCE($2, im_product),
        pr_product = COALESCE($3, pr_product),
        st_product = COALESCE($4, st_product)
    WHERE id_product = $5
    RETURNING id_product, de_product, im_product, pr_product, st_product
  `,
  remove: `DELETE FROM product WHERE id_product = $1 RETURNING id_product`,
};

export const clientQueries = {
  list: `
    SELECT id_client, na_client, nu_client
    FROM client
    ORDER BY id_client DESC
  `,
  search: `
    SELECT id_client, na_client, nu_client
    FROM client
    WHERE na_client ILIKE $1 OR nu_client ILIKE $1
    ORDER BY id_client DESC
  `,
  getById: `
    SELECT id_client, na_client, nu_client
    FROM client
    WHERE id_client = $1
  `,
  create: `
    INSERT INTO client (na_client, nu_client)
    VALUES ($1, $2)
    RETURNING id_client, na_client, nu_client
  `,
  update: `
    UPDATE client
    SET na_client = COALESCE($1, na_client),
        nu_client = COALESCE($2, nu_client)
    WHERE id_client = $3
    RETURNING id_client, na_client, nu_client
  `,
  remove: `DELETE FROM client WHERE id_client = $1 RETURNING id_client`,
};

export const paymentMethodQueries = {
  list: `
    SELECT id_payment_method, de_payment_method, dollar_payment_method
    FROM payment_method
    ORDER BY id_payment_method
  `,
  create: `
    INSERT INTO payment_method (de_payment_method, dollar_payment_method)
    VALUES ($1, $2)
    RETURNING id_payment_method, de_payment_method, dollar_payment_method
  `,
  update: `
    UPDATE payment_method
    SET de_payment_method = COALESCE($1, de_payment_method),
        dollar_payment_method = COALESCE($2, dollar_payment_method)
    WHERE id_payment_method = $3
    RETURNING id_payment_method, de_payment_method, dollar_payment_method
  `,
  remove: `
    DELETE FROM payment_method
    WHERE id_payment_method = $1
    RETURNING id_payment_method
  `,
};

export const deliveryMethodQueries = {
  list: `
    SELECT id_place, de_place
    FROM place
    ORDER BY id_place
  `,
  create: `
    INSERT INTO place (de_place)
    VALUES ($1)
    RETURNING id_place, de_place
  `,
  update: `
    UPDATE place
    SET de_place = $1
    WHERE id_place = $2
    RETURNING id_place, de_place
  `,
  remove: `DELETE FROM place WHERE id_place = $1 RETURNING id_place`,
};

export const dashboardQueries = {
  summary: `
    SELECT
      COALESCE((SELECT SUM(am_pay) FROM pay), 0) AS total_sales_amount,
      COALESCE((SELECT SUM(qt_product) FROM product_sale), 0) AS total_products_sold,
      COALESCE((SELECT SUM(st_product) FROM product), 0) AS total_stock,
      COALESCE((SELECT COUNT(*) FROM sale), 0) AS total_sales_count
  `,
  paymentBalances: `
    SELECT
      pm.id_payment_method,
      pm.de_payment_method,
      pm.dollar_payment_method,
      COALESCE(SUM(p.am_pay), 0) AS amount
    FROM payment_method pm
    LEFT JOIN pay p ON p.id_payment_method = pm.id_payment_method
    GROUP BY pm.id_payment_method, pm.de_payment_method, pm.dollar_payment_method
    ORDER BY pm.id_payment_method
  `,
};

export const salesQueries = {
  buildSalesList: (whereClause: string) => `
    WITH filtered_sales AS (
      SELECT
        s.id_sale,
        s.da_sale,
        s.id_place,
        s.kn_sale,
        s.id_client,
        s.id_user,
        c.na_client,
        c.nu_client,
        pl.de_place
      FROM sale s
      LEFT JOIN client c ON c.id_client = s.id_client
      LEFT JOIN place pl ON pl.id_place = s.id_place
      ${whereClause}
    ),
    payments AS (
      SELECT
        p.id_sale,
        json_agg(
          json_build_object(
            'paymentMethodId', pm.id_payment_method,
            'paymentMethod', pm.de_payment_method,
            'amount', p.am_pay,
            'isDollar', pm.dollar_payment_method
          )
          ORDER BY p.id_pay
        ) AS payments
      FROM pay p
      JOIN payment_method pm ON pm.id_payment_method = p.id_payment_method
      GROUP BY p.id_sale
    ),
    items AS (
      SELECT
        ps.id_sale,
        json_agg(
          json_build_object(
            'productId', pr.id_product,
            'product', pr.de_product,
            'quantity', ps.qt_product,
            'price', pr.pr_product,
            'image', pr.im_product
          )
          ORDER BY pr.id_product
        ) AS items
      FROM product_sale ps
      JOIN product pr ON pr.id_product = ps.id_product
      GROUP BY ps.id_sale
    )
    SELECT
      fs.id_sale,
      fs.da_sale,
      fs.id_place,
      fs.kn_sale,
      fs.id_client,
      fs.id_user,
      fs.na_client,
      fs.nu_client,
      fs.de_place,
      COALESCE((SELECT SUM(am_pay) FROM pay WHERE id_sale = fs.id_sale), 0) AS total_amount,
      COALESCE(payments.payments, '[]'::json) AS payments,
      COALESCE(items.items, '[]'::json) AS items
    FROM filtered_sales fs
    LEFT JOIN payments ON payments.id_sale = fs.id_sale
    LEFT JOIN items ON items.id_sale = fs.id_sale
    ORDER BY fs.da_sale DESC, fs.id_sale DESC
  `,
  filters: {
    clientId: "s.id_client = $",
    deliveryMethodId: "s.id_place = $",
    paymentMethodId:
      "s.id_sale IN (SELECT id_sale FROM pay WHERE id_payment_method = $)",
    productId:
      "s.id_sale IN (SELECT id_sale FROM product_sale WHERE id_product = $)",
    fromDate: "s.da_sale >= $",
    toDate: "s.da_sale <= $",
  },
  selectClientByNumber: `SELECT id_client FROM client WHERE nu_client = $1`,
  insertClient: `
    INSERT INTO client (na_client, nu_client)
    VALUES ($1, $2)
    RETURNING id_client
  `,
  checkClientExists: `SELECT 1 FROM client WHERE id_client = $1`,
  checkDeliveryExists: `SELECT 1 FROM place WHERE id_place = $1`,
  checkPaymentMethods: `
    SELECT id_payment_method
    FROM payment_method
    WHERE id_payment_method = ANY($1)
  `,
  insertSale: `
    INSERT INTO sale (id_client, id_user, da_sale, id_place, kn_sale)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id_sale
  `,
  selectProductStock: `
    SELECT id_product, st_product
    FROM product
    WHERE id_product = ANY($1)
  `,
  updateProductStock: `
    UPDATE product
    SET st_product = st_product - $1
    WHERE id_product = $2 AND st_product >= $1
    RETURNING id_product
  `,
  insertProductSale: `
    INSERT INTO product_sale (id_sale, id_product, qt_product)
    VALUES ($1, $2, $3)
  `,
  insertPayment: `
    INSERT INTO pay (id_sale, id_payment_method, am_pay)
    VALUES ($1, $2, $3)
  `,
};
