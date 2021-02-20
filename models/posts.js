module.exports = function(sequelize, DataTypes) {
    var Post = sequelize.define("Todo", {
      body: DataTypes.TEXT,
      author: DataTypes.STRING,
      category: DataTypes.STRING
    });
    return Post;
  };
  