module.exports = function (sequelize, DataTypes) {
    var Author = sequelize.define("Author", {
        name: DataTypes.STRING
    });

    return Author;
};