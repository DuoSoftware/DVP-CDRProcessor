/**
 * Created by Rajinda on 7/20/2015.
 */



module.exports = function (sequelize, DataTypes) {
    var CampContactCategory = sequelize.define('DB_CAMP_CampContactCategory', {
            CategoryName: {type:DataTypes.STRING,unique: 'CampContactCategoryIndex'},
            TenantId: {type:DataTypes.INTEGER,unique: 'CampContactCategoryIndex'},
            CompanyId: {type:DataTypes.INTEGER,unique: 'CampContactCategoryIndex'},
            CategoryID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
        }
    );
    return CampContactCategory;
};

