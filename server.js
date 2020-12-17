const express = require("express");
const { sequelize } = require("sequelize");
const routes = ("./routes");
const app = express();
const PORT = process.env.PORT || 3306

app.use(express.json());
app,use(express.urlencoded({ extended: true }));
app.use(routes);

sequelize.sync({force : false}).then(() => {
    app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}!`);
});
});