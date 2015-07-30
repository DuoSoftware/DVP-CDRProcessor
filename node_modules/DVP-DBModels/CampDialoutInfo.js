/**
 * Created by Rajinda on 7/20/2015.
 */


module.exports = function (sequelize, DataTypes) {
    var CampDialoutInfo = sequelize.define('DB_CAMP_CampDialoutInfo', {
            CampaignId: DataTypes.STRING,
            CompanyId: DataTypes.STRING,
            TenantId: DataTypes.STRING,
            DialerId: DataTypes.STRING,
            DialerStatus: DataTypes.STRING,
            Dialtime: DataTypes.STRING,
            Reason: DataTypes.STRING,
            SessionId: DataTypes.STRING,
            TryCount: DataTypes.STRING,
            DialoutId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
        }
    );
    return CampDialoutInfo;
};

