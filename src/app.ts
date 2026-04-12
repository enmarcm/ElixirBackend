import express from "express";
import { PORT, UPLOADS_DIR } from "./constants";
import { Routes } from "./enums";
import { startServer } from "./functions";
import { midCors, midErrorHandler, midJson, midNotFound } from "./middlewares";
import R from "./routers/allRouters";

const app = express();

app.use(midJson());
app.use(midCors());
app.use("/uploads", express.static(UPLOADS_DIR));

app.use(Routes.MAIN, R.mainRouter);
app.use(Routes.PRODUCTS, R.productsRouter);
app.use(Routes.SALES, R.salesRouter);
app.use(Routes.CLIENTS, R.clientsRouter);
app.use(Routes.PAYMENT_METHODS, R.paymentMethodsRouter);
app.use(Routes.DELIVERY_METHODS, R.deliveryMethodsRouter);
app.use(Routes.DASHBOARD, R.dashboardRouter);

app.use(midErrorHandler);
app.use(midNotFound);

startServer({ app, PORT });
