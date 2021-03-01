module.exports = function (sequelize, DataTypes) {
    var Comment = sequelize.define("Comment", {
        input: DataTypes.STRING
    });

    Comment.associate = function (models) {
        Comment.belongsTo(models.Post, {
            foreignKey: {
                allowNull: false
            }
        })

    }

    return Comment;
};

