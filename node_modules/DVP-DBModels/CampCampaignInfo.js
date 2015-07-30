/**
 * Created by Rajinda on 6/29/2015.
 */


module.exports = function (sequelize, DataTypes) {
    var CampCampaignInfo = sequelize.define('DB_CAMP_CampaignInfo', {
            CampaignName: {type: DataTypes.STRING, allowNull: false, unique: true},
            CampaignMode: DataTypes.STRING,
            CampaignChannel: DataTypes.STRING,
            DialoutMechanism: DataTypes.STRING,
            TenantId: DataTypes.INTEGER,
            CompanyId: DataTypes.INTEGER,
            Class: DataTypes.STRING,
            Type: DataTypes.STRING,
            Category: DataTypes.STRING,
            Extensions: DataTypes.STRING,
            //Concurrent: DataTypes.STRING,
            OperationalStatus: DataTypes.STRING,
            Status: DataTypes.BOOLEAN,
            CampaignId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
        }
    );


    return CampCampaignInfo;
};