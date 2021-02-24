module.exports = function(sequelize, DataTypes) {
    var Post = sequelize.define("Todo", {
      body: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
              len: [1]
          }
        },
      author: {
        type: DataTypes.STRING,
        len: [1],
        allowNull: false,
      },

      category: {
          type: DataTypes.STRING,
          allowNull: false,
          len: [1]
      }
    });

    Post.associate = function(models) {
        Post.belongsTo(models.Author, {
            foreignKey: {
                allowNull: false
            }
        })
        
    }
    return Post;

  };
  

