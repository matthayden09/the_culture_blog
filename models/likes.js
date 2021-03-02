module.exports = function (sequelize, DataTypes) {
    var Likes = sequelize.define("Likes", {
        likenum: DataTypes.STRING,
        postId: DataTypes.INTEGER
    });
    // Likes.associate = function (models) {
    //     Likes.hasMany(models.Post, {
    //     //   foreignKey: {
    //     //     allowNull: false
    //     //   }
    //     })
    
    //   }
    

    return Likes;
};