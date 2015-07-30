
module.exports = function(sequelize, DataTypes) {
    var TemplateImage = sequelize.define('CSDB_TemplateImage', {
            Type: DataTypes.STRING,
            Priority: DataTypes.INTEGER
        }
    );

    return TemplateImage;
};

