module.exports = function(sequelize, DataTypes) {
    var Comments = sequelize.define("Comments", {
        comment: {
            type: DataTypes.STRING,
            validate: {
                len: [1]
            }
        }
    });
    Comments.associate = function(models) {
        Comments.hasMany(models.Post, {
            onDelete: "cascade"
        })
    };
    return Comments;
}