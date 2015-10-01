/**
 * Created by Rajinda on 6/29/2015.
 */


module.exports = function(sequelize, DataTypes) {
    var CampConfigurations = sequelize.define('DB_CAMP_Configurations', {
            CampaignId: {type: DataTypes.INTEGER, allowNull: false, unique: true},
            ChannelConcurrency: DataTypes.INTEGER,
            AllowCallBack:DataTypes.BOOLEAN,
            //MaxCallBackCount:DataTypes.INTEGER,
            Caller: DataTypes.STRING,
            //ConfigureId:DataTypes.INTEGER,
            Status:DataTypes.BOOLEAN,
            TenantId:DataTypes.INTEGER,
            CompanyId:DataTypes.INTEGER,
            StartDate:DataTypes.DATE,
            EndDate:DataTypes.DATE,
            ConfigureId:{type:DataTypes.INTEGER, primaryKey:true,autoIncrement: true}
        }
    );
    return CampConfigurations;
};

