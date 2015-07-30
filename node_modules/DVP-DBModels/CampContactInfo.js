/**
 * Created by Rajinda on 6/29/2015.
 */


module.exports = function(sequelize, DataTypes) {
    var CampContactInfo = sequelize.define('DB_CAMP_ContactInfo', {
            ContactId:{type:DataTypes.STRING,unique: 'ContactCompositeIndex'},
            CategoryID:{type:DataTypes.INTEGER,unique: 'ContactCompositeIndex'},
            Status:DataTypes.BOOLEAN,
            TenantId:{type:DataTypes.INTEGER,unique: 'ContactCompositeIndex'},
            CompanyId:{type:DataTypes.INTEGER,unique: 'ContactCompositeIndex'},
            CamContactId:{type:DataTypes.INTEGER, primaryKey:true,autoIncrement: true}
        }
    );
    return CampContactInfo;
};

